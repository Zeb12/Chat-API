import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={className} 
        fill="currentColor"
    >
        <path d="M5.82,2H18.18A3.82,3.82,0,0,1,22,5.82V14.18A3.82,3.82,0,0,1,18.18,18H12L5.82,22a1,1,0,0,1-1.41-.58A1,1,0,0,1,4.5,20.24V5.82A3.82,3.82,0,0,1,5.82,2M12,12.83,11.42,11l-1.83.58,1-1.58L9,8.42l1.83.58L11.42,7l.58,1.83,1.58-1L12,9.42,13.58,8l-.58,1.83L15,11.42l-1.83-.58L12,12.83Z"></path>
    </svg>
);
