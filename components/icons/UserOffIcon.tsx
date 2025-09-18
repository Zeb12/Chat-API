import React from 'react';

export const UserOffIcon: React.FC<{ className?: string }> = ({ className }) => (
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
       <path d="M14.274 10.291a4 4 0 1 0 -5.554 -5.542"></path>
       <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 1.147 .167m2.686 2.682a4 4 0 0 1 .167 1.151v2"></path>
       <line x1="3" y1="3" x2="21" y2="21"></line>
    </svg>
);