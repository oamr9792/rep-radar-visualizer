// src/components/TrendChart.tsx

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { ResultItem } from '@/pages/Index'; // adjust path if needed

interface TrendChartProps {
  results: ResultItem[];
}

const TrendChart: React.FC<TrendChartProps> = ({ results }) => {
  // Build the timeseries array: [{ idx: 'T-0', url1: rank, url2: rank }, ...]
  const series: Record<string, number | string>[] = [];

  results.forEach((r) => {
    r.rankHistory.forEach((rank, i) => {
      if (!series[i]) series[i] = { idx: `T-${i}` };
      series[i][r.url] = rank;
    });
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={series}>
        <XAxis dataKey="idx" />
        <YAxis domain={[1, 50]} reversed />
        <Tooltip />
        {results.map((r, i) => (
          <Line
            key={r.url}
            type="monotone"
            dataKey={r.url}
            stroke={`hsl(${(i * 77) % 360}, 70%, 50%)`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
