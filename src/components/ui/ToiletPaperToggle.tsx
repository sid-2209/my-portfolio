'use client';

import { useTheme } from '../../contexts/ThemeContext';

export default function ToiletPaperToggle() {
  const { fadeEnabled, setFadeEnabled } = useTheme();

  const handleToggle = () => {
    setFadeEnabled(!fadeEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative group cursor-pointer focus:outline-none"
      aria-label={`Fade ${fadeEnabled ? 'enabled' : 'disabled'}`}
      role="switch"
      aria-checked={fadeEnabled}
    >
      <svg
        width="80"
        height="140"
        viewBox="0 0 80 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Toilet Paper Roll */}
        <g>
          {/* Roll Shadow */}
          <ellipse
            cx="40"
            cy="28"
            rx="24"
            ry="8"
            fill="#000000"
            opacity="0.1"
          />

          {/* Roll Body */}
          <rect
            x="16"
            y="10"
            width="48"
            height="36"
            rx="24"
            fill="#f5f5f5"
          />

          {/* Roll Inner Tube */}
          <ellipse
            cx="40"
            cy="28"
            rx="10"
            ry="4"
            fill="#d0d0d0"
          />

          {/* Roll Front Ellipse */}
          <ellipse
            cx="40"
            cy="10"
            rx="24"
            ry="8"
            fill="#ffffff"
          />

          {/* Roll Front Inner Shadow */}
          <ellipse
            cx="40"
            cy="10"
            rx="10"
            ry="4"
            fill="#e8e8e8"
          />
        </g>

        {/* Hanging Paper - Animated */}
        <g className="transition-all duration-500 ease-out">
          <rect
            x="30"
            y="46"
            width="20"
            height={fadeEnabled ? "80" : "40"}
            fill="#ffffff"
            className="transition-all duration-500 ease-out"
          />

          {/* Paper Bottom Rounded Edge */}
          <ellipse
            cx="40"
            cy={fadeEnabled ? "126" : "86"}
            rx="10"
            ry="4"
            fill="#f5f5f5"
            className="transition-all duration-500 ease-out"
          />

          {/* Paper Shadow */}
          <rect
            x="30"
            y="46"
            width="20"
            height={fadeEnabled ? "80" : "40"}
            fill="url(#paperGradient)"
            className="transition-all duration-500 ease-out"
          />
        </g>

        {/* Text on Paper */}
        <text
          x="40"
          y={fadeEnabled ? "90" : "70"}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#000000"
          fontFamily="michroma, monospace"
          className="transition-all duration-500 ease-out select-none"
        >
          {fadeEnabled ? "YES" : "NO"}
        </text>

        {/* Gradients */}
        <defs>
          <linearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-lg group-hover:bg-white/5 transition-colors duration-300 -m-2" />
    </button>
  );
}
