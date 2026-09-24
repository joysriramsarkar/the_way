'use client';

import React from 'react';

interface LogoProps {
  variant?: 'auto' | 'light' | 'dark'; // 'light': white text for dark bg, 'dark': dark text for light bg, 'auto': adapts to theme
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo({
  variant = 'auto',
  height = 46,
  className = '',
  style = {}
}: LogoProps) {
  // If light variant (e.g. for footer with dark background #090d14):
  const isLight = variant === 'light';
  const isDark = variant === 'dark';

  const textFill = isLight ? '#f3f4f6' : isDark ? '#111827' : 'var(--text-primary, #111827)';
  const enFill = isLight ? '#ffffff' : isDark ? '#111827' : 'var(--text-primary, #111827)';
  const crimsonFill = isLight ? '#ef4444' : '#c2182b';
  const dividerStroke = isLight ? '#ef4444' : '#c2182b';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 460 70"
      height={height}
      width="auto"
      fill="none"
      className={className}
      style={{ display: 'block', maxHeight: '100%', ...style }}
      aria-label="দ্য ওয়ে (The Way)"
      role="img"
    >
      <defs>
        <linearGradient id="logoCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e52b3c" />
          <stop offset="50%" stopColor="#c2182b" />
          <stop offset="100%" stopColor="#8b0e1b" />
        </linearGradient>
        <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <filter id="logoFlameGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Emblem / Torch & Star */}
      <g transform="translate(4, 5)">
        {/* Outer Shield / Diamond */}
        <polygon
          points="30,2 58,30 30,58 2,30"
          fill="#18090c"
          stroke="url(#logoCrimson)"
          strokeWidth="2.5"
        />
        <polygon
          points="30,7 53,30 30,53 7,30"
          fill="#240c10"
          stroke="url(#logoGold)"
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Revolutionary Torch / Flame */}
        <path
          d="M30 12 C33 18, 38 21, 35 28 C33 32, 29 33, 27 38 C26 40, 26 43, 30 46 C24 44, 21 38, 22 33 C23 27, 28 24, 27 18 C28 16, 29 14, 30 12 Z"
          fill="url(#logoCrimson)"
          filter="url(#logoFlameGlow)"
        />
        <path
          d="M30 20 C32 24, 34 26, 32 30 C31 32, 29 34, 29 38 C28 35, 27 32, 28 29 C29 25, 30 23, 30 20 Z"
          fill="url(#logoGold)"
        />

        {/* Socialist Star Accent */}
        <polygon
          points="30,48 31.8,53.5 37.5,53.5 32.9,56.8 34.6,62.3 30,58.9 25.4,62.3 27.1,56.8 22.5,53.5 28.2,53.5"
          fill="url(#logoGold)"
          transform="matrix(0.5 0 0 0.5 15 15)"
        />
      </g>

      {/* Typography: Bengali & English Brand */}
      {/* Bengali Title */}
      <text
        x="74"
        y="37"
        fontFamily="'Hind Siliguri', 'Noto Serif Bengali', 'Anek Bangla', sans-serif"
        fontSize="32"
        fontWeight="900"
        fill={textFill}
        letterSpacing="0.5"
      >
        দ্য <tspan fill="#c2182b">ওয়ে</tspan>
      </text>

      {/* English Subtitle / Divider */}
      <line
        x1="186"
        y1="16"
        x2="186"
        y2="50"
        stroke={dividerStroke}
        strokeWidth="2"
      />

      {/* English Title - Guaranteed High Contrast Visibility */}
      <text
        x="198"
        y="34"
        fontFamily="'Playfair Display', 'Cinzel', 'Inter', serif"
        fontSize="21"
        fontWeight="900"
        fill={enFill}
        letterSpacing="3.5"
      >
        THE WAY
      </text>

      {/* English Tagline */}
      <text
        x="199"
        y="49"
        fontFamily="'Inter', sans-serif"
        fontSize="8.5"
        fontWeight="700"
        fill={crimsonFill}
        letterSpacing="2.2"
      >
        VOICE OF SOCIALISM &amp; SOLIDARITY
      </text>
    </svg>
  );
}
