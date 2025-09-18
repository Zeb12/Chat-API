import React from 'react';

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 12c2 -2.96 0 -7 -1 -8c-1.622 3.824 -3.558 5.158 -3 9c.558 3.842 2.962 4.962 3 9c.038 -4.038 2.442 -5.158 3 -9c.558 -3.842 -1.378 -5.176 -3 -9c-1.023 1.023 -1.45 2.571 -1 4c.45 1.429 1.182 2.429 2 3c1 1 1 2.5 1 4"></path>
  </svg>
);