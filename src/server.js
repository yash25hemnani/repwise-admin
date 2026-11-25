import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));

// Health check until the admin pages exist
app.get('/', (req, res) => {
  res.send('Repwise admin is running');
});

app.listen(port, () => {
  console.log(`Repwise admin on http://localhost:${port}`);
});
