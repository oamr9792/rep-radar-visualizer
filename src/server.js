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
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

  try {
    // Fetch raw results from DataForSEO
    const rawResults = await fetchSerpResults(keyword);

    // Add defaults
    const withDefaults = rawResults.map((r) => ({
      ...r,
      sentiment: 'NEUTRAL',
      hasControl: false,
      domain: new URL(r.url).hostname,
    }));

    // ─── Save to DB using Prisma ───────────────────────────────────────────────
    await prisma.keyword.upsert({
      where: { term: keyword },
      update: {}, // we don't modify existing keywords
      create: {
        term: keyword,
        snapshots: {
          create: {
            serpItems: {
              create: withDefaults.map((item) => ({
                rank: item.rank,
                title: item.title,
                url: item.url,
                serpFeature: item.serpFeature,
                sentiment: item.sentiment,
                hasControl: item.hasControl,
                domain: item.domain,
              })),
            },
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