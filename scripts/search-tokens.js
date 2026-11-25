// Rewrites searchTokens on exercises where they're missing or don't match the name.
// Safe to run again. Dry run unless --write is passed
import { db } from '../src/firebase.js';
import { searchTokens } from '../src/search.js';

const write = process.argv.includes('--write');
const same = (a, b) => Array.isArray(a) && a.length === b.length && a.every((t, i) => t === b[i]);

async function main() {
  const snap = await db.collection('exercises').get();
  const todo = [];
  for (const doc of snap.docs) {
    const tokens = searchTokens(doc.get('name') ?? '');
    if (!same(doc.get('searchTokens'), tokens)) todo.push({ ref: doc.ref, name: doc.get('name'), tokens });
  }

  console.log(`${snap.size} exercises, ${todo.length} need searchTokens`);
  if (!write) {
    for (const { name, tokens } of todo.slice(0, 10)) console.log(`${name} -> ${tokens.join(' ')}`);
    return console.log('Dry run, add --write to save');
  }

  // A batch holds at most 500 writes. Derived data, so editedAt stays as it is
  for (let i = 0; i < todo.length; i += 500) {
    const batch = db.batch();
    for (const { ref, tokens } of todo.slice(i, i + 500)) batch.update(ref, { searchTokens: tokens });
    await batch.commit();
    console.log(`Updated ${Math.min(i + 500, todo.length)} of ${todo.length}`);
  }
}

try {
  await main();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
