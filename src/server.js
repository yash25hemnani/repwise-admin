import express from 'express';
import authRoutes from './routes/auth.js';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Render sits behind a proxy; needed for secure cookies
app.set('trust proxy', 1);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/admin', authRoutes);

// Public, no sign-in needed
app.get('/', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Repwise admin running on http://localhost:${port}`);
});
