
import React from 'react';

interface TrendChartProps {
  data: number[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (!data || data.length < 2) {
    return <div className="w-20 h-8 bg-gray-100 rounded"></div>;
  }

  // Invert the data since lower rank is better (rank 1 is top)
  const invertedData = data.map(rank => 11 - rank); // Assuming max rank is 10
  const maxValue = Math.max(...invertedData);
  const minValue = Math.min(...invertedData);
  const range = maxValue - minValue || 1;

  // Create SVG path
  const points = invertedData.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Determine trend direction and color
  const firstValue = invertedData[0];
  const lastValue = invertedData[invertedData.length - 1];
  const isImproving = lastValue > firstValue;
  const isStable = lastValue === firstValue;
  
  const strokeColor = isImproving ? '#10b981' : isStable ? '#f59e0b' : '#ef4444';
  const fillColor = isImproving ? '#10b98120' : isStable ? '#f59e0b20' : '#ef444420';

  return (
    <div className="w-20 h-8 relative">
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
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {invertedData.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={strokeColor}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* Trend indicator */}
      <div className="absolute -top-1 -right-1 text-xs">
        {isImproving ? '📈' : isStable ? '📊' : '📉'}
      </div>
    </div>
  );
};

export default TrendChart;
