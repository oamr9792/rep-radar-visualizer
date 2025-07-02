// ────────────────────────────────────────────────────────────
//  server.js  –  ORM Rank-Tracker backend (Render)
// ────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchSerpResults } from './dataforseo.js';   // ← your DataForSEO helper
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app    = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ——— Safe hostname extractor ————————————————————————————
function safeDomain (url) {
  try { return new URL(url).hostname; }
  catch { return ''; }
}

// ——— POST  /serp  ————————————————————————————————
app.post('/serp', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Missing keyword' });
  }

  try {
    console.log('🔍 Fetching SERP for:', keyword);

    /* 1️⃣  Fetch raw SERP data */
    const rawResults = await fetchSerpResults(keyword);
    console.log('✅ Raw results length:', rawResults?.length);

    if (!Array.isArray(rawResults)) {
      throw new Error('SERP fetch failed – non-array response');
    }

    /* 2️⃣  Remove items with bad URLs, add defaults */
    const withDefaults = rawResults
      .filter((r) => {
        try { new URL(r.url); return true; }
        catch {
          console.warn('⚠️ Skipping invalid URL:', r.url);
          return false;
        }
      })
      .map((r) => ({
        rank:        r.rank,
        title:       r.title,
        url:         r.url,
        domain:      safeDomain(r.url),
        serpFeature: r.serpFeature,
        sentiment:   'NEUTRAL',
        hasControl:  false,
      }));

    console.log('🧠 Normalised count:', withDefaults.length);

    /* 3️⃣  Persist snapshot + items */
    await prisma.keyword.upsert({
      where:  { term: keyword },
      update: {},
      create: {
        term: keyword,
        snapshots: {
          create: {
            serpItems: {
              create: withDefaults,   // Prisma needs "create: [ ... ]"
            },
          },
        },
      },
    });

    console.log('💾 Saved snapshot for', keyword);
    res.json({ results: withDefaults });

  } catch (e) {
    console.error('❌ /serp error:', e);
    res.status(500).json({ error: 'Failed to fetch or save SERP data' });
  }
});

// ——— Health/Root ————————————————————————————————
app.get('/', (_, res) => res.send('ORM Rank-Tracker backend ✅'));

// ——— Start ————————————————————————————————————————
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
