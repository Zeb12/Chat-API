import React from 'react';

export const CurrencyDollarIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M17.2 7a6 7 0 1 0 0 10"></path>
    <path d="M13 5h-2.2a3.4 3.4 0 0 0 -3.4 3.4h0a3.4 3.4 0 0 0 3.4 3.4h2.2"></path>
    <path d="M13 15h-2.2a3.4 3.4 0 0 1 -3.4 -3.4h0a3.4 3.4 0 0 1 3.4 -3.4h2.2"></path>
    <path d="M12 6l0 -2"></path>
    <path d="M12 18l0 2"></path>
  </svg>
);