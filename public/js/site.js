// Widget preview in the hero: add sets, mark done, rest, next exercise
const plan = [
  { name: 'Bench press', reps: 8, kg: 80, sets: 4 },
  { name: 'Incline dumbbell press', reps: 10, kg: 26, sets: 3 },
  { name: 'Cable fly', reps: 12, kg: 15, sets: 3 },
];
const REST_SECONDS = 60;
const MAX_SETS = 6;

const el = document.getElementById('widget-demo');
let state;
let timer = null;

function fresh() {
  return {
    index: 0,
    mode: 'train',
    left: REST_SECONDS,
    added: false,
    sets: plan.map((e) => Array.from({ length: e.sets }, () => ({ reps: e.reps, kg: e.kg }))),
  };
}

const kg = (n) => `${n.toLocaleString('en-GB')} kg`;
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function trainView() {
  const ex = plan[state.index];
  const sets = state.sets[state.index];
  const rows = sets
    .map((s, i) => {
      const cls = state.added && i === sets.length - 1 ? ' class="is-new"' : '';
      return `<li${cls}><span>Set ${i + 1}</span><span>${s.reps} × ${kg(s.kg)}</span></li>`;
    })
    .join('');
  const full = sets.length >= MAX_SETS ? ' disabled' : '';
  return `
    <div class="widget__head"><span>Push day</span><span>${state.index + 1} of ${plan.length}</span></div>
    <p class="widget__name">${ex.name}</p>
    <ol class="widget__sets">${rows}</ol>
    <div class="widget__actions">
      <button class="wbtn" type="button" data-act="add"${full}>Add set</button>
      <button class="wbtn wbtn--go" type="button" data-act="done">Mark done</button>
    </div>`;
}

function restView() {
  const next = plan[state.index + 1];
  const nextSets = state.sets[state.index + 1];
  const done = ((REST_SECONDS - state.left) / REST_SECONDS) * 100;
  return `
    <div class="widget__head"><span>Rest</span><span>${state.index + 2} of ${plan.length} next</span></div>
    <p class="widget__timer">${clock(state.left)}</p>
    <div class="widget__bar"><span style="width:${done}%"></span></div>
    <p class="widget__next">Up next<strong>${next.name}, ${nextSets.length} × ${next.reps} × ${kg(next.kg)}</strong></p>
    <div class="widget__actions widget__actions--one">
      <button class="wbtn" type="button" data-act="skip">Skip rest</button>
    </div>`;
}

function doneView() {
  const all = state.sets.flat();
  const volume = all.reduce((sum, s) => sum + s.reps * s.kg, 0);
  return `
    <div class="widget__head"><span>Push day</span><span>Done</span></div>
    <p class="widget__name">Session done</p>
    <dl class="widget__stats">
      <div><dt>Volume</dt><dd>${kg(volume)}</dd></div>
      <div><dt>Sets</dt><dd>${all.length}</dd></div>
    </dl>
    <div class="widget__actions widget__actions--one">
      <button class="wbtn wbtn--go" type="button" data-act="reset">Start again</button>
    </div>`;
}

function render() {
  const hadFocus = el.contains(document.activeElement);
  const keep = document.activeElement?.dataset?.act;
  const views = { train: trainView, rest: restView, done: doneView };
  el.innerHTML = views[state.mode]();
  state.added = false;
  if (hadFocus) {
    const same = keep && el.querySelector(`[data-act="${keep}"]:not(:disabled)`);
    (same || el.querySelector('button:not(:disabled)'))?.focus();
  }
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function nextExercise() {
  stopTimer();
  state.index += 1;
  state.mode = 'train';
  render();
}

function tick() {
  state.left -= 1;
  if (state.left <= 0) return nextExercise();
  el.querySelector('.widget__timer').textContent = clock(state.left);
  el.querySelector('.widget__bar span').style.width = `${((REST_SECONDS - state.left) / REST_SECONDS) * 100}%`;
}

const actions = {
  add() {
    const sets = state.sets[state.index];
    if (sets.length >= MAX_SETS) return;
    sets.push({ ...sets[sets.length - 1] });
    state.added = true;
    render();
  },
  done() {
    if (state.index === plan.length - 1) {
      state.mode = 'done';
      return render();
    }
    state.mode = 'rest';
    state.left = REST_SECONDS;
    render();
    timer = setInterval(tick, 1000);
  },
  skip: nextExercise,
  reset() {
    stopTimer();
    state = fresh();
    render();
  },
};

if (el) {
  state = fresh();
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (btn && actions[btn.dataset.act]) actions[btn.dataset.act]();
  });
}
