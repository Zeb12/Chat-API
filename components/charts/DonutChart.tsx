import React from 'react';
import type { PlanDistribution } from '../../types';

interface DonutChartProps {
  data: PlanDistribution;
}

const planDetails = {
    free: { label: 'Free', color: 'text-gray-400 dark:text-gray-500' },
    basic: { label: 'Basic', color: 'text-blue-500 dark:text-blue-400' },
    pro: { label: 'Pro', color: 'text-primary dark:text-primary-light' },
};

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const total = data.free + data.basic + data.pro;
  if (total === 0) {
    return <div className="text-center text-gray-500">No user data available.</div>;
  }

  const radius = 80;
  const strokeWidth = 20;
  const innerRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * innerRadius;

  const freePercent = (data.free / total) * 100;
  const basicPercent = (data.basic / total) * 100;
  const proPercent = (data.pro / total) * 100;

  const freeOffset = 0;
  const basicOffset = (freePercent / 100) * circumference;
  const proOffset = ((freePercent + basicPercent) / 100) * circumference;

  const segments = [
    { percent: freePercent, offset: freeOffset, color: planDetails.free.color },
    { percent: basicPercent, offset: basicOffset, color: planDetails.basic.color },
    { percent: proPercent, offset: proOffset, color: planDetails.pro.color },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx="100"
              cy="100"
              r={innerRadius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (segment.percent / 100) * circumference + segment.offset}
              className={`${segment.color} transition-all duration-500`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Users</span>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${planDetails[key as keyof PlanDistribution].color.replace('text-', 'bg-')}`}></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{planDetails[key as keyof PlanDistribution].label}:</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">{value}</span>
            </div>
        ))}
      </div>
    </div>
  );
};