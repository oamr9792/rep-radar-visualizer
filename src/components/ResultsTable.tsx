import React from 'react';
import type { ResultItem } from '@/pages/Index';

export interface ResultsTableProps {
  results: ResultItem[];
  updateSentiment: (id: string, sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE') => void;
  toggleControl: (id: string) => void;
}

// Color-coding class helper
const sentimentClass = (s: string) => {
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

const ResultsTable: React.FC<ResultsTableProps> = ({ results, updateSentiment, toggleControl }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 w-12">#</th>
            <th className="p-2">Result</th>
            <th className="p-2">Type</th>
            <th className="p-2">Sentiment</th>
            <th className="p-2">Control</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <tr key={item.id} className={sentimentClass(item.sentiment)}>
              <td className="p-2 text-center">{item.rank}</td>

              <td className="p-2">
                <div className="font-medium truncate">{item.title}</div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline break-all"
                >
                  {item.url}
                </a>
              </td>

              <td className="p-2 capitalize">{item.serpFeature}</td>

              <td className="p-2">
                <select
                  value={item.sentiment}
                  onChange={(e) => updateSentiment(item.id, e.target.value as ResultItem['sentiment'])}
                  className="border rounded px-1 py-0.5"
                >
                  <option value="POSITIVE">🟢 Positive</option>
                  <option value="NEUTRAL">🟡 Neutral</option>
                  <option value="NEGATIVE">🔴 Negative</option>
                </select>
              </td>

              <td className="p-2 text-center">
                <button onClick={() => toggleControl(item.id)}>
                  {item.hasControl ? '🛡️' : '⚪'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
