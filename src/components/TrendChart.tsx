
import React from 'react';

interface TrendChartProps {
  data: number[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (!data || data.length < 2) {
    return (
      <div className="w-20 h-8 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-xs text-gray-400">No data</span>
      </div>
    );
  }

  // Since lower rank is better (rank 1 is top), we need to invert for visualization
  // We'll map ranks to a 0-100 scale where 100 is best (rank 1) and 0 is worst
  const maxRank = Math.max(...data);
  const minRank = Math.min(...data);
  const range = maxRank - minRank || 1;

  // Invert the data so rank 1 shows at top of chart
  const invertedData = data.map(rank => {
    // Convert rank to 0-100 scale (inverted so rank 1 = 100, higher ranks = lower values)
    return ((maxRank - rank) / range) * 100;
  });

  // Create SVG path points
  const points = invertedData.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - value; // Flip Y axis so higher values appear at top
    return `${x},${y}`;
  }).join(' ');

  // Determine trend direction
  const firstRank = data[0];
  const lastRank = data[data.length - 1];
  const isImproving = lastRank < firstRank; // Lower rank = better
  const isStable = lastRank === firstRank;
  
  const strokeColor = isImproving ? '#10b981' : isStable ? '#f59e0b' : '#ef4444';
  const fillColor = isImproving ? '#10b98120' : isStable ? '#f59e0b20' : '#ef444420';
  const bgColor = isImproving ? 'bg-green-50' : isStable ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className={`w-20 h-8 relative rounded ${bgColor} border`}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        className="absolute inset-0"
        preserveAspectRatio="none"
      >
        {/* Fill area under the line */}
        <path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill={fillColor}
          stroke="none"
        />
        
        {/* Trend line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {invertedData.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - value;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={strokeColor}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      
      {/* Trend indicator with rank info */}
      <div className="absolute -top-1 -right-1 text-xs flex items-center">
        <span className="bg-white rounded px-1 text-xs font-mono">
          {lastRank}
        </span>
        <span className="ml-1">
          {isImproving ? '📈' : isStable ? '📊' : '📉'}
        </span>
      </div>
    </div>
  );
};

export default TrendChart;
