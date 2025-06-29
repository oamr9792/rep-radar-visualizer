import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ResultsTable from '@/components/ResultsTable';
// import { ShareReportModal } from '@/components/ShareReportModal'; // optional later

/* ---------- Types ---------- */
export type ResultItem = {
  id: string;
  rank: number;
  title: string;
  url: string;
  serpFeature: string;
  domain: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  hasControl: boolean;
  rankHistory: number[]; // required
};

/* ---------- Component ---------- */
const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<Record<string, ResultItem[]>>({});
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('repRadarReports');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedReports(parsed);
      setTrackedKeywords(Object.keys(parsed));
      const firstKey = Object.keys(parsed)[0];
      if (firstKey) {
        setSelectedKeyword(firstKey);
        setResults(parsed[firstKey]);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(savedReports).length) {
      localStorage.setItem('repRadarReports', JSON.stringify(savedReports));
    }
  }, [savedReports]);

  const sentimentColor = (s: ResultItem['sentiment']) => {
    switch (s) {
      case 'POSITIVE':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'NEUTRAL':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'NEGATIVE':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return '';
    }
  };

  async function refreshKeyword() {
    if (!keyword.trim()) return;

    try {
      const resp = await fetch('https://rep-radar-visualizer.onrender.com/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await resp.json();

      if (!data.results || !Array.isArray(data.results)) {
        console.error('Unexpected backend response:', data);
        alert('Backend error: could not fetch search results.');
        return;
      }

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const normalised: ResultItem[] = data.results.map((r: any) => ({
        id: uuid(),
        rank: r.rank,
        title: r.title,
        url: r.url,
        serpFeature: r.serpFeature,
        domain: new URL(r.url).hostname ?? '',
        sentiment: r.sentiment ?? 'NEUTRAL',
        hasControl: r.hasControl ?? false,
        rankHistory: r.rankHistory ?? [r.rank],
      }));
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setResults(normalised);
      setSavedReports((prev) => ({ ...prev, [keyword]: normalised }));
      setTrackedKeywords((prev) => [...new Set([...prev, keyword])]);
      setSelectedKeyword(keyword);
    } catch (err) {
      console.error('Error fetching SERP data:', err);
      alert('Failed to fetch data. Please check your connection.');
    }
  }

  const updateSentiment = (id: string, sentiment: ResultItem['sentiment']) => {
    setResults((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sentiment } : item))
    );
  };

  const toggleControl = (id: string) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, hasControl: !item.hasControl } : item
      )
    );
  };

  useEffect(() => {
    if (savedReports[selectedKeyword]) {
      setResults(savedReports[selectedKeyword]);
    }
  }, [selectedKeyword, savedReports]);

  return (
    <main className="max-w-screen-lg mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Reputation Tracker</h1>
        <p className="text-gray-600">
          Track how your name or brand appears on Google search.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword"
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          onClick={refreshKeyword}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Track
        </button>

        {trackedKeywords.length > 0 && (
          <select
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {trackedKeywords.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        )}
      </section>

      <ResultsTable
  results={results}
  updateSentiment={updateSentiment}   // ✅ matches ResultsTableProps
  toggleControl={toggleControl}       // ✅ matches ResultsTableProps
/>


      {/* Uncomment if ShareReportModal is implemented */}
      {/* <ShareReportModal
        isOpen={false}
        onClose={() => {}}
        score={0}
        lastUpdated=""
        keyword={selectedKeyword}
        results={results}
      /> */}
    </main>
  );
};

export default Index;
