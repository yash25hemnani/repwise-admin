import { db } from './firebase.js';
import { searchWords } from './search.js';

// f_webp, not f_auto: one cached file per size instead of one per browser format
export const THUMB = 'w_96,h_96,c_fill,f_webp,q_auto';
export const LARGE = 'w_400,c_fill,f_webp,q_auto';

// Sized Cloudinary URL from the stored original, so no secret is needed here
export const still = (url, transform) => url.replace('/upload/', `/upload/${transform}/`);

export function status(data) {
  if (data.archived) return 'archived';
  return data.editedAt ? 'edited' : 'imported';
}

async function names(collection) {
  const snap = await db.collection(collection).get();
  return Object.fromEntries(snap.docs.map((doc) => [doc.id, doc.get('name')]));
}

async function readLists() {
  const [muscleGroups, targetMuscles, equipment] = await Promise.all(
    ['muscleGroups', 'targetMuscles', 'equipment'].map(names),
  );
  return { muscleGroups, targetMuscles, equipment };
}

// Aggregation counts: about one read per 1,000 exercises, not one per exercise
async function readCounts() {
  const exercises = db.collection('exercises');
  const [total, withGif] = await Promise.all([
    exercises.count().get(),
    exercises.where('media.gif', '!=', null).count().get(),
  ]);
  return { total: total.data().count, withGif: withGif.data().count };
}

const TTL = 5 * 60 * 1000;

// These rarely change, so each server instance keeps them for 5 minutes.
// A failed read isn't kept, so the next request tries again
function cachedFor5Minutes(read) {
  let cached = null;
  return () => {
    if (cached && Date.now() - cached.at < TTL) return cached.value;
    const value = read();
    cached = { at: Date.now(), value };
    value.catch(() => {
      if (cached?.value === value) cached = null;
    });
    return value;
  };
}

export const loadLists = cachedFor5Minutes(readLists);
export const loadCounts = cachedFor5Minutes(readCounts);

function toRow(doc, lists) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    group: lists.muscleGroups[data.muscleGroupId] ?? data.muscleGroupId,
    status: status(data),
    thumbs: (data.media?.stills ?? []).map((s) => still(s.url, THUMB)),
    hasGif: Boolean(data.media?.gif),
  };
}

// Same as shelf_snap: query the first word, filter the rest here
export async function listExercises({ q, limit }, lists) {
  const [first, ...rest] = searchWords(q);
  let query = db.collection('exercises');
  if (first) query = query.where('searchTokens', 'array-contains', first);
  const snap = await query.orderBy('name').limit(limit + 1).get();

  const rows = snap.docs
    .slice(0, limit)
    .filter((doc) => rest.every((w) => doc.get('searchTokens')?.includes(w)))
    .map((doc) => toRow(doc, lists));
  return { rows, hasMore: snap.size > limit };
}

// Firestore throws on IDs like "..", "a/b" or "__x__", so those count as missing
const validId = (id) => /^[^/]{1,200}$/.test(id) && !/^\.\.?$/.test(id) && !/^__.*__$/.test(id);

export async function getExercise(id, lists) {
  if (!validId(id)) return null;
  const doc = await db.collection('exercises').doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    ...toRow(doc, lists),
    target: lists.targetMuscles[data.targetMuscleId] ?? data.targetMuscleId,
    secondaries: (data.secondaryMuscleIds ?? []).map((m) => lists.targetMuscles[m] ?? m),
    equipment: lists.equipment[data.equipmentId] ?? data.equipmentId,
    level: data.level,
    category: data.category,
    force: data.force,
    mechanic: data.mechanic,
    steps: data.steps ?? [],
    stills: (data.media?.stills ?? []).map((s) => still(s.url, LARGE)),
    gif: data.media?.gif?.url ?? null,
    source: data.source ?? null,
    editedAt: data.editedAt?.toDate?.() ?? null,
  };
}
