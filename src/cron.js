import cron from 'node-cron';
import dotenv from 'dotenv';
import { fetchSerpResults } from './dataforseo.js';
import fs from 'fs';

dotenv.config();

// Example list of keywords to auto-refresh
const keywordsFile = './keywords.json';

// Helper: load tracked keywords
function loadKeywords() {
  if (!fs.existsSync(keywordsFile)) return [];
  const raw = fs.readFileSync(keywordsFile);
  return JSON.parse(raw);
}

// Helper: save latest results (just to file for now)
function saveSnapshot(keyword, results) {
  const now = new Date().toISOString().split('T')[0];
  const outputFile = `./snapshots/${keyword.replace(/\s+/g, '_')}_${now}.json`;

  if (!fs.existsSync('./snapshots')) {
    fs.mkdirSync('./snapshots');
  }

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`✔ Saved snapshot for "${keyword}" → ${outputFile}`);
}

// 🕒 Schedule: Every Sunday at 03:00 AM
cron.schedule('0 3 * * 0', async () => {
  console.log(`⏳ Running weekly reputation check...`);

  const keywords = loadKeywords();

  for (const keyword of keywords) {
    try {
      const results = await fetchSerpResults(keyword);
      saveSnapshot(keyword, results);
    } catch (e) {
      console.error(`❌ Failed for "${keyword}":`, e.message);
    }
  }

  console.log('✅ Weekly cron job completed');
});
