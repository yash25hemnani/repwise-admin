// Opens an exercise by fetching only its detail: into the right panel on wide
// screens, into the dialog on narrow ones. Without this script, rows and the
// close link are plain page links
const side = document.querySelector('.split-side');
const sideDetail = side.querySelector('.side-detail');
const sideScroll = side.querySelector('.side-scroll');
const sideEmpty = side.querySelector('.side-empty');
const dialog = document.querySelector('dialog.detail');
const dialogBody = dialog.querySelector('.detail-body');
const rows = document.querySelector('.rows');
const listUrl = dialog.dataset.list;
const listTitle = 'Exercises · Repwise';
const wide = matchMedia('(min-width: 1001px)');

let latest = 0;
// The close event fires later, so closes made here are counted and skipped
let skipCloses = 0;
// The detail on show, kept in one place at a time so its ids stay unique
let html = sideDetail.hidden ? '' : sideScroll.innerHTML;

const isDetail = () => location.pathname.startsWith('/admin/exercises/');

function mark(row) {
  rows?.querySelector('[aria-current]')?.removeAttribute('aria-current');
  row?.setAttribute('aria-current', 'true');
}

function reset() {
  latest++;
  mark(null);
  document.title = listTitle;
}

function rowFor(url) {
  const path = new URL(url, location.href).pathname;
  return [...(rows?.querySelectorAll('a.row') ?? [])].find((a) => a.pathname === path);
}

function closeQuietly() {
  skipCloses++;
  dialog.close();
}

function fillSide(content) {
  sideScroll.innerHTML = content;
  sideScroll.scrollTop = 0;
  sideDetail.hidden = !content;
  sideEmpty.hidden = Boolean(content);
  side.classList.toggle('is-open', Boolean(content));
}

// Puts the detail where the screen width wants it
function place() {
  if (wide.matches) {
    if (dialog.open) closeQuietly();
    dialogBody.innerHTML = '';
    fillSide(html);
    return;
  }
  fillSide('');
  dialogBody.innerHTML = html;
  dialog.scrollTop = 0;
  if (html && !dialog.open) dialog.showModal();
  if (!html && dialog.open) closeQuietly();
}

// Any surprise (signed out, server error, offline) falls back to a full page load
async function show(url, push) {
  const ticket = ++latest;
  const row = rowFor(url);
  row?.setAttribute('aria-busy', 'true');
  try {
    const res = await fetch(url, { headers: { 'X-Partial': 'detail' } });
    if (res.redirected || (!res.ok && res.status !== 404)) throw new Error(String(res.status));
    const text = await res.text();
    if (ticket !== latest) return;
    html = text;
    place();
    if (push) history.pushState(null, '', url);
    mark(row);
    const name = new DOMParser().parseFromString(text, 'text/html').querySelector('.detail-name')?.textContent;
    document.title = name ? `${name} · ${listTitle}` : listTitle;
  } catch {
    if (ticket === latest) location.href = url;
  } finally {
    row?.removeAttribute('aria-busy');
  }
}

// Back to the list; focus returns to the row if it was in the panel
function closeDetail(pushUrl) {
  const row = rows?.querySelector('[aria-current]');
  const hadFocus = side.contains(document.activeElement);
  html = '';
  place();
  reset();
  if (pushUrl && isDetail()) history.pushState(null, '', listUrl);
  if (hadFocus) row?.focus();
}

rows?.addEventListener('click', (e) => {
  const link = e.target.closest('a.row');
  if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  show(link.href, true);
});

side.addEventListener('click', (e) => {
  if (!e.target.closest('.detail-close')) return;
  e.preventDefault();
  closeDetail(true);
});

dialog.addEventListener('click', (e) => {
  // The backdrop counts as the dialog itself; its content sits in .detail-body
  if (e.target === dialog) dialog.close();
  if (e.target.closest('.detail-close')) {
    e.preventDefault();
    dialog.close();
  }
});

// Esc, the backdrop or the close link
dialog.addEventListener('close', () => {
  if (skipCloses) {
    skipCloses--;
    return;
  }
  html = '';
  dialogBody.innerHTML = '';
  reset();
  if (isDetail()) history.pushState(null, '', listUrl);
});

window.addEventListener('popstate', () => {
  if (isDetail()) return show(location.href, false);
  closeDetail(false);
});

wide.addEventListener('change', place);

// A direct link on a narrow screen opens the dialog
if (html) place();
