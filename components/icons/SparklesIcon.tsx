
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
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
        <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"></path>
        <path d="M8 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"></path>
        <path d="M12 10a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"></path>
        <path d="M12 2v4"></path>
        <path d="M12 16v4"></path>
        <path d="M16.5 7.5l-3 3"></path>
        <path d="M10.5 13.5l-3 3"></path>
        <path d="M7.5 7.5l3 3"></path>
        <path d="M13.5 13.5l3 3"></path>
        <path d="M20 12h-4"></path>
        <path d="M8 12h-4"></path>
    </svg>
);
