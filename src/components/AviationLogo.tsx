import React from 'react';

interface AviationLogoProps {
  className?: string;
  size?: number;
}

export const AviationLogo: React.FC<AviationLogoProps> = ({
  className = 'w-6 h-6',
  size = 24,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sleek Ascending Jetliner Silhouette based on uploaded design */}
      <g transform="translate(4, 4) scale(0.92)">
        {/* Main Fuselage & Cockpit */}
        <path
          d="M78 22 C84 27, 88 33, 85 37 C82 40, 75 44, 66 51 L38 72 C32 76, 26 78, 22 75 C19 72, 21 66, 27 60 L54 36 C63 28, 72 17, 78 22 Z"
          fill="currentColor"
        />

        {/* Cockpit Windows Highlight */}
        <path
          d="M74 27 C77 29, 79 32, 78 34 C77 35, 74 36, 71 35 C68 34, 69 31, 71 29 Z"
          fill="#38bdf8"
          opacity="0.9"
        />

        {/* Main Port Wing (Ascending Left Wing) */}
        <path
          d="M51 40 L16 35 C12 34, 11 36, 14 39 L41 53 C45 51, 48 46, 51 40 Z"
          fill="currentColor"
        />

        {/* Port Engine Jet Nacelle */}
        <path
          d="M44 43 C42 41, 38 41, 36 43 C34 45, 34 48, 37 50 C40 52, 44 51, 46 48 C47 46, 46 44, 44 43 Z"
          fill="#0284c7"
        />

        {/* Starboard Wing (Lower Right Wing) */}
        <path
          d="M60 55 L78 69 C82 72, 84 75, 82 76 C80 77, 76 75, 71 70 L55 58 Z"
          fill="currentColor"
        />

        {/* Starboard Engine Nacelle */}
        <path
          d="M68 64 C66 62, 63 63, 62 65 C61 67, 62 70, 65 71 C68 72, 71 70, 71 67 C71 65, 70 64, 68 64 Z"
          fill="#0284c7"
        />

        {/* Tail Empennage & Vertical Stabilizer */}
        <path
          d="M26 62 L18 72 C15 75, 14 77, 17 77 C20 77, 24 74, 29 70 Z"
          fill="currentColor"
        />
        
        {/* Horizontal Tail Wing */}
        <path
          d="M24 73 L15 80 C13 82, 14 83, 17 83 L30 76 Z"
          fill="currentColor"
        />

        {/* Cabin Window Slits */}
        <path
          d="M65 37 L63 39 M59 42 L57 44 M53 47 L51 49 M47 52 L45 54 M41 57 L39 59"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};
