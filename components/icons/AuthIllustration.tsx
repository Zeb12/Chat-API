import React from 'react';

export const AuthIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>
    
    {/* Large chat bubble */}
    <path d="M116.5 293.5C114.5 287.5 125 249 146.5 233.5C168 218 208.833 218.833 226 226C279.5 248 297.5 297 271.5 329.5C245.5 362 189.5 358 159 337.5C128.5 317 118.5 299.5 116.5 293.5Z" fill="white" filter="url(#shadow)" />
    <path d="M128 300L112 344L156 324" fill="white" />
    
    {/* Small chat bubble */}
    <path d="M370.5 130C375.5 137.333 370.8 156.4 353.5 167C336.2 177.6 302.5 174.5 290 167C263.5 151.5 264 122.5 290.5 106.5C317 90.5 355.5 108 370.5 130Z" fill="white" fillOpacity="0.8" filter="url(#shadow)" />
    
    {/* Main Bot Icon */}
    <g transform="translate(256, 256) scale(1.2) translate(-256, -256)" filter="url(#shadow)">
        <rect x="186" y="196" width="140" height="120" rx="15" fill="white"/>
        <circle cx="226" cy="256" r="10" fill="#6D28D9"/>
        <circle cx="286" cy="256" r="10" fill="#6D28D9"/>
        <path d="M216 286H296" stroke="#6D28D9" strokeWidth="5" strokeLinecap="round"/>
        <rect x="226" y="176" width="10" height="20" rx="5" fill="#A78BFA" />
        <rect x="276" y="176" width="10" height="20" rx="5" fill="#A78BFA" />
    </g>

  </svg>
);
