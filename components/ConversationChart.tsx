
import React from 'react';

interface ConversationChartProps {
  data: number[];
  className?: string;
}

export const ConversationChart: React.FC<ConversationChartProps> = ({ data, className = '' }) => {
  if (!data || data.length < 2) {
    return <div className={`w-full h-full flex items-center justify-center text-xs text-gray-400 ${className}`}>Not enough data</div>;
  }

  const width = 100;
  const height = 30;
  const padding = 2;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  const points = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((point - minValue) / (range || 1)) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
