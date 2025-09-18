import React from 'react';

export const CubeIcon: React.FC<{ className?: string }> = ({ className }) => (
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
       <path d="M21 12l-9 9l-9 -9l9 -9z"></path>
       <path d="M3 12v6l9 3l9 -3v-6"></path>
       <path d="M12 21v-9"></path>
    </svg>
);