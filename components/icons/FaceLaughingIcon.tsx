import React from 'react';

export const FaceLaughingIcon: React.FC<{ className?: string }> = ({ className }) => (
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
       <path d="M9 14h6a3 3 0 0 1 -6 0z"></path>
       <path d="M9 8l6 3"></path>
       <path d="M9 11l6 -3"></path>
    </svg>
);
