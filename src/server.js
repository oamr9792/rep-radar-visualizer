import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchSerpResults } from './dataforseo.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/serp', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    console.log(`🔎 Fetching SERP for: ${keyword}`);
    const results = await fetchSerpResults(keyword);

    const withDefaults = results.map(r => ({
      rank: r.rank,
      title: r.title,
      url: r.url,
      serpFeature: r.serpFeature,
      sentiment: 'NEUTRAL',
      hasControl: false,
    }));

    await prisma.keyword.upsert({
      where: { term: keyword },
      update: {},
      create: {
        term: keyword,
        snapshots: {
          create: {
            serpItems: withDefaults,
          },
        },
      },
    });

    console.log(`✅ Saved SERP results for: ${keyword}`);
    res.json({ results: withDefaults });
  } catch (e) {
    console.error('❌ Error in /serp:', e.message);
    res.status(500).json({ error: 'Failed to fetch or save SERP data' });
  }
});

app.get('/', (req, res) => {
  res.send('ORM Rank Tracker backend is running ✅');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
