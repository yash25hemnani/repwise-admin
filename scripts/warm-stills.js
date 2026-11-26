// Requests every list thumbnail and detail still once so Cloudinary builds and caches it.
// Without this, the first viewer of each image waits about 2.5s. Safe to run again
import { db } from '../src/firebase.js';
import { still, THUMB, LARGE } from '../src/exercises.js';

const PARALLEL = 8;

async function main() {
  const snap = await db.collection('exercises').get();
  const urls = snap.docs.flatMap((doc) =>
    (doc.get('media.stills') ?? []).flatMap((s) => [still(s.url, THUMB), still(s.url, LARGE)]),
  );
  console.log(`${snap.size} exercises, ${urls.length} images`);

  let done = 0;
  const failed = [];
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++];
      try {
        const res = await fetch(url);
        await res.arrayBuffer();
        if (!res.ok) failed.push(`${res.status} ${url}`);
      } catch (err) {
        failed.push(`${err.message} ${url}`);
      }
      if (++done % 100 === 0) console.log(`${done} of ${urls.length}`);
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker));

  console.log(`Warmed ${urls.length - failed.length} of ${urls.length}`);
  for (const line of failed) console.log(`Failed: ${line}`);
  if (failed.length) process.exitCode = 1;
}

try {
  await main();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
