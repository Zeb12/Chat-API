import React from 'react';

export const PaintBrushIcon: React.FC<{ className?: string }> = ({ className }) => (
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
       <path d="M3 21v-4a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v4"></path>
       <path d="M21 3a16 16 0 0 0 -12 12a16 16 0 0 0 12 12"></path>
    </svg>
);