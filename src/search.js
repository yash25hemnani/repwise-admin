// Same scheme as shelf_snap: word prefixes, 2 to 15 letters
const MIN = 2;
const MAX = 15;

// Lowercase, accent-free words, cut to MAX. "Sit-Up" -> sit, up
export function searchWords(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= MIN)
    .map((w) => w.slice(0, MAX));
}

// "Barbell Squat" -> ba, bar, barb, ..., sq, squ, squa, squat
export function searchTokens(name) {
  const tokens = new Set();
  for (const word of searchWords(name)) {
    for (let i = MIN; i <= word.length; i++) tokens.add(word.slice(0, i));
  }
  return [...tokens];
}
