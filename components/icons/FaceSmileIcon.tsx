import React from 'react';

export const FaceSmileIcon: React.FC<{ className?: string }> = ({ className }) => (
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
       <line x1="9" y1="10" x2="9.01" y2="10"></line>
       <line x1="15" y1="10" x2="15.01" y2="10"></line>
       <path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path>
    </svg>
);