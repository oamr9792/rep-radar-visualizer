import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ResultsTable from '@/components/ResultsTable';
import TrendChart from '@/components/TrendChart';

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

/* ---------- Config ---------- */
const API_URL = 'https://rep-radar-visualizer.onrender.com/serp';

/* ---------- Component ---------- */
const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [savedReports, setSavedReports] = useState<Record<string, ResultItem[]>>(
    {}
  );
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [score, setScore] = useState(0);

  /* ---------- localStorage load & persist ---------- */
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
        setScore(calculateScore(parsed[first]));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('repRadarReports', JSON.stringify(savedReports));
  }, [savedReports]);

  /* ---------- Score ---------- */
  function calculateScore(list: ResultItem[]) {
    const W = { TOP: 0.7, MID: 0.2, LOW: 0.1 };
    const SENT = { POSITIVE: -1, NEUTRAL: 0, NEGATIVE: 1 } as const;
    let raw = 0;
    list.forEach((i) => {
      const bucket = i.rank <= 10 ? W.TOP : i.rank <= 30 ? W.MID : W.LOW;
      raw += bucket * SENT[i.sentiment];
    });
    return Math.round(((1 - raw) / 2) * 100);
  }

  /* ---------- Fetch & normalise ---------- */
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
        alert('Backend error'); console.error(data); return;
      }

      const prevArr = savedReports[keyword] ?? [];
      const prevMap = new Map(prevArr.map((p) => [p.url, p]));

      const normalised: ResultItem[] = (data.results as RawSerpResult[]).map(
        (r) => {
          const prev = prevMap.get(r.url);
          const history = prev ? [r.rank, ...prev.rankHistory] : [r.rank];

          return {
            id: prev?.id ?? uuid(),
            rank: r.rank,
            title: r.title,
            url: r.url,
            serpFeature: r.serpFeature,
            domain: new URL(r.url).hostname,
            sentiment: prev?.sentiment ?? 'NEUTRAL',
            hasControl: prev?.hasControl ?? false,
            rankHistory: history.slice(0, 30),
          };
        }
      );

      setResults(normalised);
      setScore(calculateScore(normalised));
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

  /* ---------- Update helpers ---------- */
  const updateSentiment = (id: string, sentiment: ResultItem['sentiment']) => {
    setResults((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, sentiment } : i
      );
      setSavedReports((p) => ({ ...p, [selectedKeyword]: next }));
      setScore(calculateScore(next));
      return next;
    });
  };

  const toggleControl = (id: string) => {
    setResults((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, hasControl: !i.hasControl } : i
      );
      setSavedReports((p) => ({ ...p, [selectedKeyword]: next }));
      return next;
    });
  };

  const loadReport = (term: string) => {
    setSelectedKeyword(term);
    setKeyword(term);
    const set = savedReports[term] ?? [];
    setResults(set);
    setScore(calculateScore(set));
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 border-r bg-gray-50 p-4 space-y-2">
          <h2 className="text-sm font-semibold flex justify-between mb-2">
            Saved Reports
            <button onClick={() => setSidebarOpen(false)}>✖</button>
          </h2>
          <ul className="space-y-1 text-sm">
            {trackedKeywords.map((k) => (
              <li key={k}>
                <button className="text-blue-600 underline" onClick={() => loadReport(k)}>
                  {k}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="px-2 py-1 border rounded">
            {sidebarOpen ? '←' : '☰'}
          </button>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword"
            className="flex-grow border rounded px-3 py-2"
          />
          <button onClick={() => refreshKeyword(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            Track
          </button>
          <button onClick={() => refreshKeyword(true)} className="ml-2 px-3 py-2 border rounded bg-green-600 text-white">
            🔄 Update Now
          </button>
        </div>

        {isLoading && <p className="text-sm text-gray-500">Fetching results…</p>}

        {/* Score */}
        <section className="border rounded p-4 w-max">
          <h3 className="text-sm font-semibold mb-1">Reputation Score</h3>
          <p className="text-2xl font-bold">{score}/100</p>
        </section>

        {/* Table */}
        <ResultsTable
          results={results}
          updateSentiment={updateSentiment}
          toggleControl={toggleControl}
        />

        {/* Trend */}
        {results.length > 0 && (
          <section className="border rounded p-4">
            <h3 className="text-sm font-semibold mb-2">Movement History by URL</h3>
            <TrendChart results={results} />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
