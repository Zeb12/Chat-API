import React from 'react';

export const FaceWithRollingEyesIcon: React.FC<{ className?: string }> = ({ className }) => (
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
       <circle cx="12" cy="12" r="9"></circle>
       <path d="M15 14h-6"></path>
       <path d="M9 9.5c.333 -1 2 -1.5 4 -1.5"></path>
       <path d="M15 9.5c-.333 -1 -2 -1.5 -4 -1.5"></path>
    </svg>
);
