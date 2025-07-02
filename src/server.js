// ────────────────────────────────────────────────────────────
//  server.js  –  ORM Rank-Tracker backend (Render)
// ────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchSerpResults } from './dataforseo.js'; // ← your DataForSEO helper
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ——— Safe hostname extractor ————————————————————————————
function safeDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// ——— POST  /serp  ————————————————————————————————
app.post('/serp', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Missing keyword' });
  }

  try {
    console.log('🔍 Fetching SERP for:', keyword);

    // 1️⃣ Fetch raw results
    const rawResults = await fetchSerpResults(keyword);
    if (!Array.isArray(rawResults)) {
      throw new Error('SERP fetch failed – non-array response');
    }

    // 2️⃣ Get previous snapshot’s sentiment/control (if exists)
    const previousSnapshot = await prisma.snapshot.findFirst({
      where: { keyword: { term: keyword } },
      orderBy: { createdAt: 'desc' },
      include: { serpItems: true },
    });

    const previousMap = new Map();
    if (previousSnapshot) {
      for (const item of previousSnapshot.serpItems) {
        previousMap.set(item.url, {
          sentiment: item.sentiment,
          hasControl: item.hasControl,
        });
      }
    }

    // 3️⃣ Normalize results and preserve sentiment/control
    const normalised = rawResults
      .filter((r) => {
        try {
          new URL(r.url);
          return true;
        } catch {
          console.warn('⚠️ Skipping invalid URL:', r.url);
          return false;
        }
      })
      .map((r) => {
        const previous = previousMap.get(r.url);
        return {
          rank: r.rank,
          title: r.title,
          url: r.url,
          domain: safeDomain(r.url),
          serpFeature: r.serpFeature,
          sentiment: previous?.sentiment || 'NEUTRAL',
          hasControl: previous?.hasControl || false,
        };
      });

    // 4️⃣ Persist to DB
    await prisma.keyword.upsert({
      where: { term: keyword },
      update: {},
      create: {
        term: keyword,
      },
    });

    const keywordRecord = await prisma.keyword.findUnique({
      where: { term: keyword },
    });

    await prisma.snapshot.create({
      data: {
        keywordId: keywordRecord.id,
        serpItems: {
          create: normalised,
        },
      },
    });

    console.log('💾 Saved snapshot for', keyword);
    res.json({ results: normalised });
  } catch (e) {
    console.error('❌ /serp error:', e);
    res.status(500).json({ error: 'Failed to fetch or save SERP data' });
  }
});

// ——— Health Check ———————————————————————————————————
app.get('/', (_, res) => res.send('ORM Rank-Tracker backend ✅'));

// ——— Start ————————————————————————————————————————
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
