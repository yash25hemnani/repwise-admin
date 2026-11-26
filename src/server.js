import express from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import authRoutes from './routes/auth.js';
import exerciseRoutes from './routes/exercises.js';
import { requireAdmin } from './require-admin.js';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Absolute, so views resolve the same locally and in the Vercel function
app.set('views', join(import.meta.dirname, '..', 'views'));
// Vercel sits behind a proxy; needed for secure cookies
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Local only: Vercel serves public/ from its CDN and ignores this
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// Render the sidebar as the admin left it, so it doesn't flash open on load
app.use((req, res, next) => {
  res.locals.sidebarCollapsed = req.cookies.sidebar === 'collapsed';
  next();
});

// Public auth routes first, then everything under /admin needs an admin
app.use('/admin', authRoutes);
app.use('/admin', requireAdmin);

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.use('/admin', exerciseRoutes);

// Public, no sign-in needed
app.get('/', (req, res) => {
  res.render('home');
});

// Last: a plain 500 instead of Express's default page with the stack
// Express spots error handlers by their 4 parameters, so _next stays
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).send('Something went wrong.');
});

// Vercel imports the default export; listen only when run directly
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Repwise admin running on http://localhost:${port}`);
  });
}

export default app;
