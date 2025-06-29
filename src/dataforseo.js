import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function fetchSerpResults(keyword, locationName = 'United States', languageCode = 'en') {
  const task = {
    keyword,
    location_name: locationName,
    language_code: languageCode,
    depth: 50,
  };

  const auth = {
    username: process.env.DATAFORSEO_API_LOGIN,
    password: process.env.DATAFORSEO_API_PASSWORD,
  };

  const { data } = await axios.post(
    'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    [task],
    { auth }
  );

  const results = data.tasks[0].result[0].items.map((item) => ({
    rank: item.rank_absolute,
    url: item.url,
    title: item.title,
    snippet: item.description,
    serpFeature: item.type,
  }));

  return results;
}
