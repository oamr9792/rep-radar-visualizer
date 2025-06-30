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

function safeDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// ──────────────────────────── SERP Endpoint ────────────────────────────
app.post('/serp', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Invalid keyword' });
  }

  try {
    const rawResults = await fetchSerpResults(keyword);

    if (!Array.isArray(rawResults)) {
      throw new Error('SERP data fetch failed');
    }

    const withDefaults = rawResults.map((r) => ({
      ...r,
      domain: safeDomain(r.url),
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

// ──────────────────────────── Health Check ────────────────────────────
app.get('/', (req, res) => {
  res.send('ORM Rank Tracker backend is running ✅');
});

// ──────────────────────────── Start Server ────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
