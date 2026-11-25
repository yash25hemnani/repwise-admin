import { db } from './firebase.js';
import { searchWords } from './search.js';

const THUMB = 'w_96,h_96,c_fill,f_auto,q_auto';
const LARGE = 'w_400,c_fill,f_auto,q_auto';

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

// About 35 docs, small enough to read on every request
export async function loadLists() {
  const [muscleGroups, targetMuscles, equipment] = await Promise.all(
    ['muscleGroups', 'targetMuscles', 'equipment'].map(names),
  );
  return { muscleGroups, targetMuscles, equipment };
}

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
  };
}
