import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchSerpResults } from './dataforseo.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/serp', async (req, res) => {
  const { keyword, location = 'United States', language = 'en' } = req.body;

  try {
    const results = await fetchSerpResults(keyword, location, language);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch SERP' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
