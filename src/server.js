import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import { requireAdmin } from './require-admin.js';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Render sits behind a proxy; needed for secure cookies
app.set('trust proxy', 1);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// Public auth routes first, then everything under /admin needs an admin
app.use('/admin', authRoutes);
app.use('/admin', requireAdmin);

app.get('/admin', (req, res) => {
  res.render('admin');
});

// Public, no sign-in needed
app.get('/', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Repwise admin running on http://localhost:${port}`);
});
