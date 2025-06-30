/*  src/pages/Index.tsx  */
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

/* ---------- Helper ---------- */
function safeExtractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    console.warn('Bad URL in result:', url);
    return '';
  }
}

/* ---------- Component ---------- */
const Index = () => {
  const [keyword, setKeyword]         = useState('');
  const [results, setResults]         = useState<ResultItem[]>([]);
  const [savedReports, setSaved]      = useState<Record<string, ResultItem[]>>({});
  const [trackedKeywords, setTracked] = useState<string[]>([]);
  const [selectedKeyword, setSel]     = useState('');
  const [isLoading, setLoad]          = useState(false);
  const [sidebarOpen, setSide]        = useState(true);
  const [score, setScore]             = useState(0);

  /* ---------- localStorage load / persist ---------- */
  useEffect(() => {
    const stored = localStorage.getItem('repRadarReports');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSaved(parsed);
      setTracked(Object.keys(parsed));
      const first = Object.keys(parsed)[0];
      if (first) {
        setSel(first);
        setResults(parsed[first]);
        setScore(calcScore(parsed[first]));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('repRadarReports', JSON.stringify(savedReports));
  }, [savedReports]);

  /* ---------- Score ---------- */
  function calcScore(list: ResultItem[]) {
    const W = { TOP: 0.7, MID: 0.2, LOW: 0.1 };
    const F = { POSITIVE: -1, NEUTRAL: 0, NEGATIVE: 1 } as const;
    const raw = list.reduce(
      (sum, i) =>
        sum +
        (i.rank <= 10 ? W.TOP : i.rank <= 30 ? W.MID : W.LOW) * F[i.sentiment],
      0
    );
    return Math.round(((1 - raw) / 2) * 100);
  }

  /* ---------- Fetch & normalise ---------- */
  async function refreshKeyword(manual = false) {
    if (!keyword.trim()) return;
    setLoad(true);
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
            domain: safeExtractDomain(r.url),
            sentiment: prev?.sentiment ?? 'NEUTRAL',
            hasControl: prev?.hasControl ?? false,
            rankHistory: history.slice(0, 30),
          };
        }
      );

      setResults(normalised);
      setScore(calcScore(normalised));
      setSaved((p) => ({ ...p, [keyword]: normalised }));
      if (!trackedKeywords.includes(keyword)) setTracked((p) => [...p, keyword]);
      setSel(keyword);
      if (manual) alert('Report updated!');
    } catch (e) {
      console.error(e);
      alert('Network error.');
    } finally {
      setLoad(false);
    }
  }

  /* ---------- Update helpers ---------- */
  const updateSentiment = (id: string, sentiment: ResultItem['sentiment']) =>
    setResults((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, sentiment } : i));
      setSaved((p) => ({ ...p, [selectedKeyword]: next }));
      setScore(calcScore(next));
      return next;
    });

  const toggleControl = (id: string) =>
    setResults((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, hasControl: !i.hasControl } : i));
      setSaved((p) => ({ ...p, [selectedKeyword]: next }));
      return next;
    });

  const loadReport = (term: string) => {
    setSel(term);
    setKeyword(term);
    const set = savedReports[term] ?? [];
    setResults(set);
    setScore(calcScore(set));
  };

  /* ---------- UI (Lovable design unchanged) ---------- */
  return (
    <div className="flex h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <img
                src="/lovable-uploads/e20c03c5-960c-4030-8120-16eb69de9a38.png"
                alt="Reputation Citadel"
                className="h-16 w-auto"
              />
              <button
                onClick={() => setSide(false)}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                style={{ color: '#17163e' }}
              >
                ✕
              </button>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#17163e' }}>
              Reputation Dashboard
            </h1>
          </div>

          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Tracked Keywords
            </h2>
            <div className="space-y-2">
              {trackedKeywords.map((k) => (
                <button
                  key={k}
                  onClick={() => loadReport(k)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedKeyword === k
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: selectedKeyword === k ? '#17163e' : 'transparent',
                  }}
                >
                  <div className="font-medium">{k}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {savedReports[k]?.length || 0} results
                  </div>
                </button>
              ))}
              {trackedKeywords.length === 0 && (
                <p className="text-gray-500 text-sm italic">No keywords tracked yet</p>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSide(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ color: '#17163e' }}
              >
                ☰
              </button>
            )}

            <div className="flex-1 flex gap-4">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword to track..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => refreshKeyword(true)}
                disabled={isLoading}
                className="px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#17163e' }}
              >
                {isLoading ? 'Tracking...' : 'Track Keyword'}
              </button>
              <button
                onClick={() => refreshKeyword(true)}
                disabled={isLoading}
                className="px-4 py-3 border-2 font-medium rounded-lg transition-all hover:bg-opacity-10"
                style={{
                  borderColor: '#d1be9e',
                  color: '#d1be9e',
                  backgroundColor: 'transparent',
                }}
              >
                🔄 Update
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Card */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Reputation Score</h3>
                  <p className="text-sm text-gray-600">Based on search result sentiment analysis</p>
                </div>
                <div className="text-right">
                  <div
                    className="text-4xl font-bold mb-1"
                    style={{
                      color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  >
                    {score}
                  </div>
                  <div className="text-sm text-gray-500">out of 100</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    backgroundColor: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results ({results.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage sentiment and control status for each result
                </p>
              </div>
              <ResultsTable
                results={results}
                updateSentiment={updateSentiment}
                toggleControl={toggleControl}
              />
            </div>
          )}

          {/* Trend Chart */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking Trends</h3>
              <TrendChart results={results} />
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#f3f4f6' }}
              >
                <div className="text-3xl" style={{ color: '#17163e' }}>
                  🔍
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Enter a keyword above and click "Track Keyword" to start monitoring your online
                reputation.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
