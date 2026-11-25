import { Router } from 'express';
import { loadLists, listExercises, getExercise } from '../exercises.js';

const router = Router();

const PAGE = 30;
const MAX = 900;

// A multiple of 30, from 30 to 900
function pageLimit(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return PAGE;
  return Math.min(MAX, Math.max(PAGE, Math.ceil(n / PAGE) * PAGE));
}

function query(params) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.limit > PAGE) qs.set('limit', params.limit);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function render(req, res, id = null) {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const limit = pageLimit(req.query.limit);
  const view = {
    q, limit, rows: [], hasMore: false, selected: null, notFound: false, error: null,
    base: req.baseUrl + req.path,
    keep: query({ q, limit }),
    more: query({ q, limit: limit + PAGE }) + `#row-${limit}`,
  };

  try {
    const lists = await loadLists();
    const [list, selected] = await Promise.all([
      listExercises({ q, limit }, lists),
      id ? getExercise(id, lists) : null,
    ]);
    Object.assign(view, list, { selected, notFound: Boolean(id && !selected) });
    view.hasMore &&= limit < MAX;
    if (view.notFound) res.status(404);
  } catch (err) {
    // A missing index error includes the link that creates it
    console.error(err.message);
    view.error = "Couldn't load exercises. The server log has the details.";
    res.status(500);
  }
  res.render('exercises', view);
}

router.get('/exercises', (req, res) => render(req, res));
router.get('/exercises/:id', (req, res) => render(req, res, req.params.id));

export default router;
