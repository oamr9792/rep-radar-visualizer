// src/pages/Index.tsx
import { useState, useEffect } from 'react';
import ResultsTable from '@/components/ResultsTable';      // <- adjust if path differs
import { ShareReportModal } from '@/components/ShareReportModal'; // optional
import { v4 as uuid } from 'uuid';

/* ----------  Types  ---------- */
type SerpItem = {
  id: string;
  rank: number;
  title: string;
  url: string;
  serpFeature: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  hasControl: boolean;
  rankHistory?: number[];
};

/* ----------  Component  ---------- */
const Index = () => {
  /* ----- state ----- */
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SerpItem[]>([]);
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<Record<string, SerpItem[]>>(
    {}
  );
  const [selectedKeyword, setSelectedKeyword] = useState('');

  /* ----- load any reports from localStorage on first mount ----- */
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

  /* ----- persist to localStorage whenever savedReports change ----- */
  useEffect(() => {
    if (Object.keys(savedReports).length) {
      localStorage.setItem('repRadarReports', JSON.stringify(savedReports));
    }
  }, [savedReports]);

  /* ----- helper: sentiment colour ----- */
  const sentimentColor = (s: SerpItem['sentiment']) => {
    switch (s) {
      case 'POSITIVE':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'NEUTRAL':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'NEGATIVE':
        return 'bg-red-50 border-l-4 border-red-400';
      default:
        return '';
    }
  };

  /* ----- backend fetch + save ----- */
  async function refreshKeyword() {
    if (!keyword.trim()) return;

    try {
      const resp = await fetch('https://rep-radar-visualizer.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await resp.json();

      // backend may return {error: "..."} on failure
      if (!data.results || !Array.isArray(data.results)) {
        console.error('Unexpected backend response:', data);
        alert('Backend error: could not fetch search results.');
        return;
      }

      // normalise: ensure unique id, default flags
      const normalised: SerpItem[] = data.results.map((r: any) => ({
        ...r,
        id: uuid(),
        sentiment: r.sentiment ?? 'NEUTRAL',
        hasControl: r.hasControl ?? false,
      }));

      // save to state & localStorage
      setResults(normalised);
      setSavedReports((prev) => ({ ...prev, [keyword]: normalised }));
      setTrackedKeywords((prev) => [...new Set([...prev, keyword])]);
      setSelectedKeyword(keyword);
    } catch (err) {
      console.error('Error fetching SERP data:', err);
      alert('Network error: failed to fetch results.');
    }
  }

  /* ----- update sentiment / control helpers ----- */
  const updateSentiment = (id: string, newSentiment: SerpItem['sentiment']) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, sentiment: newSentiment } : item
      )
    );
  };

  const toggleControl = (id: string) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, hasControl: !item.hasControl } : item
      )
    );
  };

  /* ----- when user selects a saved keyword from dropdown ----- */
  useEffect(() => {
    if (savedReports[selectedKeyword]) {
      setResults(savedReports[selectedKeyword]);
    }
  }, [selectedKeyword, savedReports]);

  /* ----------  Render  ---------- */
  return (
    <main className="max-w-screen-lg mx-auto p-6 space-y-6">
      {/* ---------- header ---------- */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Reputation Tracker</h1>
        <p className="text-gray-600">
          Track how your brand or name appears on Google SERPs.
        </p>
      </header>

      {/* ---------- search bar ---------- */}
      <section className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          onClick={refreshKeyword}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Track
        </button>

        {/* Saved keyword selector */}
        {trackedKeywords.length > 0 && (
          <select
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="ml-4 border rounded px-3 py-2"
          >
            {trackedKeywords.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        )}
      </section>

      {/* ---------- results table ---------- */}
      <ResultsTable
        results={results}
        sentimentColor={sentimentColor}
        updateSentiment={updateSentiment}
        toggleControl={toggleControl}
      />

      {/* (Optional) Share report modal */}
      <ShareReportModal keyword={selectedKeyword} results={results} />
    </main>
  );
};

export default Index;
