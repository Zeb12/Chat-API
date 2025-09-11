
import React from 'react';

// FIX: Add `style` prop to allow for dynamic styling, such as setting the background color.
// This resolves a TypeScript error where the component was being used with an inline style.
export const BotIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    style={style}
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M7 7h10a2 2 0 0 1 2 2v1l1 1v3l-1 1v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-3l-1 -1v-3l1 -1v-1a2 2 0 0 1 2 -2z"></path>
    <path d="M10 16h4"></path>
    <circle cx="8.5" cy="11.5" r=".5" fill="currentColor"></circle>
    <circle cx="15.5" cy="11.5" r=".5" fill="currentColor"></circle>
  </svg>
);
