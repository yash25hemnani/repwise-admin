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

app.use(authRoutes);

// Placeholder until the home page exists
app.get('/', (req, res) => {
  res.send('Repwise admin is running');
});

app.listen(port, () => {
  console.log(`Repwise admin on http://localhost:${port}`);
});
