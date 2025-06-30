
import React from 'react';
import type { ResultItem } from '@/pages/Index';

export interface ResultsTableProps {
  results: ResultItem[];
  updateSentiment: (id: string, sentiment: ResultItem['sentiment']) => void;
  toggleControl: (id: string) => void;
}

const sentimentConfig = {
  POSITIVE: { bg: 'bg-green-50', border: 'border-l-4 border-green-500', text: 'text-green-700' },
  NEUTRAL: { bg: 'bg-yellow-50', border: 'border-l-4 border-yellow-500', text: 'text-yellow-700' },
  NEGATIVE: { bg: 'bg-red-50', border: 'border-l-4 border-red-500', text: 'text-red-700' }
};

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  updateSentiment,
  toggleControl,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead style={{ backgroundColor: '#17163e' }}>
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Result
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Trend
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Sentiment
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Control
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {results.map((item, index) => {
            const [latest, prev] = item.rankHistory;
            const trend =
              prev === undefined
                ? { icon: '⏺', color: 'text-gray-500', label: 'New' }
                : latest < prev
                ? { icon: '↗️', color: 'text-green-600', label: 'Improving' }
                : latest > prev
                ? { icon: '↘️', color: 'text-red-600', label: 'Declining' }
                : { icon: '➡️', color: 'text-gray-500', label: 'Stable' };

            const config = sentimentConfig[item.sentiment];

            return (
              <tr 
                key={item.id} 
                className={`${config.bg} ${config.border} hover:bg-opacity-80 transition-colors`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold" style={{ color: '#17163e' }}>
                      {item.rank}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.title}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {item.domain}
                    </a>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize" style={{ 
                    backgroundColor: '#d1be9e20',
                    color: '#17163e'
                  }}>
                    {item.serpFeature}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{trend.icon}</span>
                    <span className={`text-sm font-medium ${trend.color}`}>
                      {trend.label}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <select
                    value={item.sentiment}
                    onChange={(e) =>
                      updateSentiment(
                        item.id,
                        e.target.value as ResultItem['sentiment']
                      )
                    }
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ focusRingColor: '#17163e' }}
                  >
                    <option value="POSITIVE">🟢 Positive</option>
                    <option value="NEUTRAL">🟡 Neutral</option>
                    <option value="NEGATIVE">🔴 Negative</option>
                  </select>
                </td>

                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleControl(item.id)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title={item.hasControl ? 'You have control' : 'No control'}
                  >
                    <span className="text-2xl">
                      {item.hasControl ? '🛡️' : '⚪'}
                    </span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
