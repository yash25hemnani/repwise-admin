// The phone menu, on every admin page. Without the script, the menu opens through #sidebar and closes through #
const menuButton = document.querySelector('.menu-button');
const sidebar = document.getElementById('sidebar');

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  if (open) sidebar.querySelector('.nav-item')?.focus();
  else menuButton.focus();
}

// Desktop: fold the sidebar to icons and remember it in a cookie the server reads
const shell = document.querySelector('.shell');
const toggle = document.querySelector('.sidebar-toggle');

if (shell && toggle) {
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const collapsed = shell.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-label', collapsed ? 'Expand menu' : 'Collapse menu');
    const secure = location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `sidebar=${collapsed ? 'collapsed' : 'open'}; path=/admin; max-age=31536000; samesite=lax${secure}`;
  });
}

if (menuButton && sidebar) {
  menuButton.addEventListener('click', (e) => {
    e.preventDefault();
    setMenu(true);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar-close, .scrim')) return;
    e.preventDefault();
    setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });
}
