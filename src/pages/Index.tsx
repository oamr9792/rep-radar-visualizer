import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ResultsTable from '@/components/ResultsTable';

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
  rankHistory: number[];
};

type RawSerpResult = {
  rank: number;
  title: string;
  url: string;
  serpFeature: string;
};

const API_URL = 'https://rep-radar-visualizer.onrender.com/serp';

const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [savedReports, setSavedReports] = useState<Record<string, ResultItem[]>>({});
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('repRadarReports');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedReports(parsed);
      setTrackedKeywords(Object.keys(parsed));
      const first = Object.keys(parsed)[0];
      if (first) {
        setSelectedKeyword(first);
        setResults(parsed[first]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('repRadarReports', JSON.stringify(savedReports));
  }, [savedReports]);

  const reputationScore = () => {
    if (!results.length) return 0;

    const TOP10 = 0.7;
    const SECOND = 0.2;
    const THIRD = 0.1;

    const SENT_FACTOR = { POSITIVE: -1, NEUTRAL: 0, NEGATIVE: 1 } as const;

    let score = 0;
    results.forEach((r) => {
      const bucket = r.rank <= 10 ? TOP10 : r.rank <= 30 ? SECOND : THIRD;
      score += bucket * SENT_FACTOR[r.sentiment];
    });

    return Math.round(((1 - score) / 2) * 100);
  };

  async function refreshKeyword(manual = false) {
    if (!keyword.trim()) return;
    setIsLoading(true);

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await resp.json();

      if (!Array.isArray(data.results)) {
        alert('Backend error. See console.');
        console.error(data);
        return;
      }

      const prev = savedReports[keyword] ?? [];
      const normalised: ResultItem[] = data.results.map((r: RawSerpResult) => {
        const match = prev.find((p) => p.url === r.url);
        const history = match ? [r.rank, ...match.rankHistory] : [r.rank];

        return {
          id: uuid(),
          rank: r.rank,
          title: r.title,
          url: r.url,
          serpFeature: r.serpFeature,
          domain: new URL(r.url).hostname,
          sentiment: (match?.sentiment as ResultItem['sentiment']) ?? 'NEUTRAL',
          hasControl: match?.hasControl ?? false,
          rankHistory: history.slice(0, 5),
        };
      });

      setResults(normalised);
      setSavedReports((p) => ({ ...p, [keyword]: normalised }));
      if (!trackedKeywords.includes(keyword))
        setTrackedKeywords((p) => [...p, keyword]);
      setSelectedKeyword(keyword);

      if (manual) alert('Report updated!');
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsLoading(false);
    }
  }

  const updateSentiment = (id: string, sentiment: ResultItem['sentiment']) =>
    setResults((prev) =>
      prev.map((i) => (i.id === id ? { ...i, sentiment } : i))
    );

  const toggleControl = (id: string) =>
    setResults((prev) =>
      prev.map((i) => (i.id === id ? { ...i, hasControl: !i.hasControl } : i))
    );

  const loadReport = (term: string) => {
    setSelectedKeyword(term);
    setKeyword(term);
    setResults(savedReports[term] ?? []);
  };

  useEffect(() => {
    if (savedReports[selectedKeyword]) {
      setResults(savedReports[selectedKeyword]);
    }
  }, [selectedKeyword, savedReports]);

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <aside className="w-64 border-r bg-gray-50 p-4 space-y-2">
          <h2 className="text-sm font-semibold mb-2 flex justify-between">
            Saved Reports
            <button onClick={() => setSidebarOpen(false)}>✖</button>
          </h2>
          <ul className="space-y-1 text-sm">
            {trackedKeywords.map((k) => (
              <li key={k}>
                <button
                  className="text-blue-600 underline"
                  onClick={() => loadReport(k)}
                >
                  {k}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '☰'}
          </button>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword"
            className="flex-grow border rounded px-3 py-2"
          />

          <button
            onClick={() => refreshKeyword(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Track
          </button>

          <button
            onClick={() => refreshKeyword(true)}
            className="ml-2 px-3 py-2 border rounded bg-green-600 text-white"
          >
            🔄 Update Now
          </button>
        </div>

        {isLoading && <p className="text-sm text-gray-500">Fetching results…</p>}

        <section className="border rounded p-4 w-max">
          <h3 className="text-sm font-semibold mb-1">Reputation Score</h3>
          <p className="text-2xl font-bold">{reputationScore()}/100</p>
        </section>

        <ResultsTable
          results={results}
          updateSentiment={updateSentiment}
          toggleControl={toggleControl}
        />
      </main>
    </div>
  );
};

export default Index;
