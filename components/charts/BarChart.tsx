import React, { useState } from 'react';
import type { UserGrowthDataPoint } from '../../types';

interface BarChartProps {
  data: UserGrowthDataPoint[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const chartHeight = 200;
  const chartWidth = 500; // Viewbox width
  const barPadding = 15;
  const barWidth = (chartWidth - barPadding * (data.length + 1)) / data.length;

  const maxValue = Math.max(...data.map(d => d.count), 0);
  const yScale = maxValue === 0 ? 0 : (chartHeight - 20) / maxValue;

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels */}
        <text x="0" y="15" className="text-xs fill-current text-gray-500 dark:text-gray-400">{maxValue}</text>
        <text x="0" y={chartHeight / 2} className="text-xs fill-current text-gray-500 dark:text-gray-400">{Math.ceil(maxValue / 2)}</text>
        
        {/* Bars and X-axis labels */}
        {data.map((d, i) => {
          const x = barPadding * (i + 1) + barWidth * i;
          const y = chartHeight - d.count * yScale;
          const height = d.count * yScale;

          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                className="fill-current text-primary/70 dark:text-primary/60 hover:text-primary dark:hover:text-primary transition-colors"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ 
                        x: e.clientX - rect.left + rect.width / 2,
                        y: e.clientY - rect.top - 10,
                        label: formatDate(d.date), 
                        value: d.count 
                    });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-current text-gray-500 dark:text-gray-400"
              >
                {formatDate(d.date).split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none p-2 text-xs bg-gray-900 text-white rounded-md shadow-lg transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${(tooltip.x / chartWidth) * 100}%`, top: `${(tooltip.y / chartHeight) * 100}%` }}
        >
          <strong>{tooltip.value} users</strong> on {tooltip.label}
        </div>
      )}
    </div>
  );
};