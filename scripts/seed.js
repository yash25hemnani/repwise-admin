import { createInterface } from 'node:readline/promises';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../src/firebase.js';
import { cloudinary } from '../src/cloudinary.js';

// Moving the pin is a deliberate change (D-32)
const SHA = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5';
const BASE = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${SHA}`;
const PROJECT = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id;

const GROUPS = { chest: 'Chest', back: 'Back', shoulders: 'Shoulders', arms: 'Arms', legs: 'Legs', core: 'Core' };

const MUSCLE_GROUP = {
  chest: 'chest',
  lats: 'back', 'middle-back': 'back', 'lower-back': 'back', traps: 'back',
  shoulders: 'shoulders', neck: 'shoulders',
  biceps: 'arms', triceps: 'arms', forearms: 'arms',
  quadriceps: 'legs', hamstrings: 'legs', glutes: 'legs', calves: 'legs', adductors: 'legs', abductors: 'legs',
  abdominals: 'core',
};

const EQUIPMENT = {
  'body-only': 'Bodyweight', barbell: 'Barbell', dumbbell: 'Dumbbell', kettlebells: 'Kettlebell',
  cable: 'Cable', machine: 'Machine', bands: 'Band', 'e-z-curl-bar': 'EZ bar',
  'medicine-ball': 'Medicine ball', 'exercise-ball': 'Exercise ball', 'foam-roll': 'Foam roller', other: 'Other',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const slug = (value) => value.replaceAll(' ', '-');
// middle-back -> Middle back
const label = (id) => id[0].toUpperCase() + id.slice(1).replaceAll('-', ' ');

function toDoc(ex) {
  const [target, ...extra] = ex.primaryMuscles.map(slug);
  const secondaries = [...new Set([...extra, ...ex.secondaryMuscles.map(slug)])].filter((m) => m !== target);
  const equipmentId = slug(ex.equipment ?? 'body only');

  // The dataset is pinned, so an unknown value means the tables above need updating
  for (const m of [target, ...secondaries]) {
    if (!MUSCLE_GROUP[m]) throw new Error(`${ex.id}: unknown muscle "${m}"`);
  }
  if (!EQUIPMENT[equipmentId]) throw new Error(`${ex.id}: unknown equipment "${equipmentId}"`);

  return {
    name: ex.name,
    source: 'free-exercise-db',
    muscleGroupId: MUSCLE_GROUP[target],
    targetMuscleId: target,
    secondaryMuscleIds: secondaries,
    equipmentId,
    steps: ex.instructions,
    level: ex.level,
    category: ex.category,
    force: ex.force ?? null,
    mechanic: ex.mechanic ?? null,
    editedAt: null,
    archived: false,
  };
}

// Every list doc an exercise points at, directly or through a muscle's group
function listDocsFor(doc) {
  const docs = new Map();
  for (const m of [doc.targetMuscleId, ...doc.secondaryMuscleIds]) {
    const group = MUSCLE_GROUP[m];
    docs.set(`targetMuscles/${m}`, { name: label(m), muscleGroupId: group });
    docs.set(`muscleGroups/${group}`, { name: GROUPS[group], order: Object.keys(GROUPS).indexOf(group) + 1 });
  }
  docs.set(`equipment/${doc.equipmentId}`, { name: EQUIPMENT[doc.equipmentId] });
  return docs;
}

async function loadDataset() {
  const res = await fetch(`${BASE}/dist/exercises.json`);
  if (!res.ok) throw new Error(`Dataset fetch failed: ${res.status}`);
  return res.json();
}

// Returns path -> data for the docs that exist
async function existing(paths) {
  const found = new Map();
  for (let i = 0; i < paths.length; i += 300) {
    const snaps = await db.getAll(...paths.slice(i, i + 300).map((p) => db.doc(p)));
    for (const snap of snaps) if (snap.exists) found.set(snap.ref.path, snap.data());
  }
  return found;
}

async function upload(url, publicId) {
  for (let attempt = 1; ; attempt++) {
    try {
      // Fixed public ID + overwrite, so a retry never duplicates
      return await cloudinary.uploader.upload(url, { public_id: publicId, overwrite: true });
    } catch (err) {
      if (attempt === 3) throw new Error(`Upload ${publicId} failed: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
}

// Stills first, then list docs, then the exercise (D-33)
async function addExercise(ex, doc, missing) {
  const stills = [];
  for (const [i, path] of ex.images.entries()) {
    const r = await upload(`${BASE}/exercises/${path}`, `repwise/exercises/${ex.id}/${i}`);
    stills.push({ publicId: r.public_id, url: r.secure_url, width: r.width, height: r.height });
  }
  for (const [path, data] of listDocsFor(doc)) {
    if (!missing.has(path)) continue;
    await db.doc(path).set(data);
    missing.delete(path);
  }
  // create, not set: fails rather than overwrite an existing doc
  await db.doc(`exercises/${ex.id}`).create({
    ...doc,
    media: { stills, gif: null },
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toLowerCase() === 'y';
}

async function main() {
  let exercises = await loadDataset();
  if (only) {
    exercises = exercises.filter((ex) => ex.id === only);
    if (!exercises.length) throw new Error(`No exercise with id ${only}`);
  }

  const docs = new Map(exercises.map((ex) => [ex.id, toDoc(ex)]));
  const found = await existing(exercises.map((ex) => `exercises/${ex.id}`));
  const toAdd = exercises.filter((ex) => !found.has(`exercises/${ex.id}`));
  const edited = exercises.filter((ex) => found.get(`exercises/${ex.id}`)?.editedAt).length;
  const unedited = exercises.length - toAdd.length - edited;

  // Only list docs that an exercise added in this run needs (D-29)
  const needed = new Map();
  for (const ex of toAdd) for (const [path, data] of listDocsFor(docs.get(ex.id))) needed.set(path, data);
  const foundLists = await existing([...needed.keys()]);
  const missing = new Set([...needed.keys()].filter((p) => !foundLists.has(p)));
  const count = (prefix) => [...missing].filter((p) => p.startsWith(prefix)).length;

  console.log(`${exercises.length} exercises in the dataset`);
  console.log(`Add ${toAdd.length}, skip ${unedited} existing, skip ${edited} edited`);
  console.log(`Create ${count('muscleGroups/')} muscle groups, ${count('targetMuscles/')} target muscles, ${count('equipment/')} equipment`);

  if (dryRun) return console.log('Dry run, nothing written');
  if (!toAdd.length) return console.log('Nothing to add');
  if (!(await confirm(`Write to ${PROJECT}? (y/N) `))) return console.log('Nothing written');

  // 4 workers share one queue. A failure writes no doc and the run carries on
  const queue = [...toAdd];
  const failed = [];
  let done = 0;
  async function worker() {
    for (let ex; (ex = queue.shift()); ) {
      try {
        await addExercise(ex, docs.get(ex.id), missing);
      } catch (err) {
        failed.push(ex.id);
        console.error(`${ex.id}: ${err.message}`);
      }
      console.log(`${++done}/${toAdd.length} ${ex.id}`);
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));

  console.log(`Added ${toAdd.length - failed.length}, skipped ${unedited} existing, skipped ${edited} edited, failed ${failed.length}`);
  if (failed.length) {
    console.log(`Failed: ${failed.join(', ')}`);
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
