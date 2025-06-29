
import { fetchSerpResults } from '../dataforseo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keyword, locationName = 'United States', languageCode = 'en' } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    console.log('Fetching SERP results for keyword:', keyword);
    const results = await fetchSerpResults(keyword, locationName, languageCode);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in SERP API:', error);
    return res.status(500).json({ error: 'Failed to fetch SERP results' });
  }
}
</rav-write>
