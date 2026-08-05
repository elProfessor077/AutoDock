'use client';

import React from 'react';

// Official SVG icons for all supported ecosystems

export const NodeIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Node.js">
    {/* 3D Shaded Hexagon Facets */}
    <path d="M16 2L2.5 9.8V22.2L16 30L29.5 22.2V9.8L16 2Z" fill="#5FA04E"/>
    <path d="M16 2L29.5 9.8V22.2L16 30V2Z" fill="#388E3C"/>
    <path d="M16 2L2.5 9.8L16 17.5L29.5 9.8L16 2Z" fill="#83CD29"/>
    {/* Inner JS Letterforms */}
    <g fill="#FFFFFF">
      <path d="M10 13.5v5h1.8v-2.9l2.8 2.9h1.6v-5h-1.8v2.9l-2.8-2.9H10z"/>
      <path d="M19.2 15.6c-.3-.2-.7-.3-1.2-.3-.5 0-.9.1-1.2.4-.3.2-.4.5-.4.9 0 .3.1.6.4.8.3.2.7.4 1.3.5.7.2 1.2.5 1.6.7.3.3.5.7.5 1.2 0 .6-.2 1.2-.8 1.6-.6.4-1.2.5-2.1.5-.6 0-1.2-.1-1.7-.4-.5-.2-.9-.6-1.1-1.1l1.3-.9c.2.3.4.5.7.7.3.1.7.2 1.1.2.5 0 .9-.1 1.1-.3.2-.2.4-.4.4-.8 0-.3-.1-.5-.4-.7-.3-.2-.7-.3-1.3-.5-.7-.2-1.2-.5-1.6-.7-.3-.3-.5-.7-.5-1.2 0-.6.2-1.2.7-1.5.5-.4 1.2-.5 1.9-.5.6 0 1.1.1 1.6.4.5.2.8.6 1 .1l-1.3.9c-.1-.3-.3-.5-.6-.6z"/>
    </g>
  </svg>
);

export const PythonIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Python">
    <path d="M15.7 2C9.5 2 9.9 4.7 9.9 4.7L10 7.5H16.1V8.3H7.5C7.5 8.3 2 7.7 2 13.9C2 20.1 6.8 19.7 6.8 19.7H8.5V17C8.5 17 8.2 13 12.4 13H18.5C18.5 13 22 13.1 22 9.5C22 5.9 18.5 2 15.7 2ZM13.1 4.7C13.8 4.7 14.4 5.3 14.4 6C14.4 6.7 13.8 7.3 13.1 7.3C12.4 7.3 11.8 6.7 11.8 6C11.8 5.3 12.4 4.7 13.1 4.7Z" fill="#3776AB"/>
    <path d="M16.3 30C22.5 30 22.1 27.3 22.1 27.3L22 24.5H15.9V23.7H24.5C24.5 23.7 30 24.3 30 18.1C30 11.9 25.2 12.3 25.2 12.3H23.5V15C23.5 15 23.8 19 19.6 19H13.5C13.5 19 10 18.9 10 22.5C10 26.1 13.5 30 16.3 30ZM18.9 27.3C18.2 27.3 17.6 26.7 17.6 26C17.6 25.3 18.2 24.7 18.9 24.7C19.6 24.7 20.2 25.3 20.2 26C20.2 26.7 19.6 27.3 18.9 27.3Z" fill="#FFD43B"/>
  </svg>
);

export const GoIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Go">
    <path d="M2.5 12H11.5C11.8 12 12 12.2 12 12.5V14.5C12 14.8 11.8 15 11.5 15H2.5C2.2 15 2 14.8 2 14.5V12.5C2 12.2 2.2 12 2.5 12Z" fill="#00ADD8"/>
    <path d="M0.5 17H8.5C8.8 17 9 17.2 9 17.5V19.5C9 19.8 8.8 20 8.5 20H0.5C0.2 20 0 19.8 0 19.5V17.5C0 17.2 0.2 17 0.5 17Z" fill="#00ADD8"/>
    <path d="M4.5 22H10.5C10.8 22 11 22.2 11 22.5V24.5C11 24.8 10.8 25 10.5 25H4.5C4.2 25 4 24.8 4 24.5V22.5C4 22.2 4.2 22 4.5 22Z" fill="#00ADD8"/>
    <path d="M20.2 10.5C16 10.5 13.2 13.5 13.2 18.2C13.2 22.8 16.2 25.8 20.6 25.8C24.4 25.8 27.2 23.3 27.4 19.8H21V16.8H31C31.2 17.8 31.3 18.8 31.3 19.8C31.3 27 26.6 30 20.5 30C13.5 30 9 24.8 9 18.2C9 11.5 13.8 6.5 20.4 6.5C24.5 6.5 28 8.2 30.1 11.1L27.5 13.2C25.9 11.5 23.4 10.5 20.2 10.5Z" fill="#00ADD8"/>
  </svg>
);

export const RustIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Rust">
    <circle cx="16" cy="16" r="14" stroke="#DEA584" strokeWidth="2.5" fill="none"/>
    <path d="M16 6V8M16 24V26M6 16H8M24 16H26M9 9L10.5 10.5M21.5 21.5L23 23M9 23L10.5 21.5M21.5 10.5L23 9" stroke="#DEA584" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 11H17.5C19.5 11 21 12 21 14C21 15.5 20 16.5 18.5 16.8L21.5 22H18.5L16 17.2H14.5V22H12V11ZM14.5 13V15.5H17C17.8 15.5 18.5 15 18.5 14.25C18.5 13.5 17.8 13 17 13H14.5Z" fill="#DEA584"/>
  </svg>
);

export const JavaIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Java">
    {/* Red Steam Wiggles */}
    <path d="M12 4C12 4 10 7 13 9.5C15.5 11.5 14 14 14 14C14 14 16 12 15 10C13.8 7.5 12 4 12 4Z" fill="#EA2D2E"/>
    <path d="M16 2C16 2 13.5 5.5 17 8.5C19.5 10.5 18 13.5 18 13.5C18 13.5 20.5 11 19 8.5C17.2 5.5 16 2 16 2Z" fill="#E76F00"/>
    {/* Coffee Cup / Saucer Curves */}
    <path d="M9 17C9 17 7 18 10 19C14 20.2 20 20.2 23 19C25 18 23 17 23 17C23 17 24.5 17.8 21.5 19.2C17.5 21 12.5 21 9.5 19.2C6.5 17.8 9 17 9 17Z" fill="#5382A1"/>
    <path d="M8 21.5C8 21.5 6 22.5 10 23.5C14.5 24.6 21 24.6 24 23.5C26 22.5 24 21.5 24 21.5C24 21.5 25.5 22.3 22.5 23.8C18 25.2 12 25.2 8.5 23.8C5 22.3 8 21.5 8 21.5Z" fill="#007396"/>
    <path d="M11 26C8 26 6.5 27 6.5 27C6.5 27 8.5 28 12.5 28.5C17 29.1 22.5 28.8 25.5 28C28 27.2 26.5 26.5 26.5 26.5C26.5 26.5 24.5 27.3 21 27.8C16 28.5 11 28 11 26Z" fill="#5382A1"/>
  </svg>
);

export const RubyIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Ruby">
    <path d="M7 6L2 14L16 29L30 14L25 6H7Z" fill="#CC342D"/>
    <path d="M7 6L12 14H2L7 6Z" fill="#E85649"/>
    <path d="M25 6L30 14H20L25 6Z" fill="#99221B"/>
    <path d="M12 14L16 29L20 14H12Z" fill="#D43F35"/>
    <path d="M12 14L16 6L20 14H12Z" fill="#F2796E"/>
  </svg>
);

export const PhpIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="PHP">
    <ellipse cx="16" cy="16" rx="15" ry="10" fill="#777BB4"/>
    <path d="M8 12H11.5C13 12 14 12.5 14 14C14 15.5 13 16 11.5 16H9.5L9 20H7.5L8 12ZM9.8 13.5L9.3 15H11C11.8 15 12.3 14.7 12.3 14.2C12.3 13.7 11.8 13.5 11 13.5H9.8Z" fill="#FFFFFF"/>
    <path d="M14.5 12H16L15.5 15.5H17.5L18 12H19.5L18.5 20H17L17.5 16.7H15.5L15 20H13.5L14.5 12Z" fill="#FFFFFF"/>
    <path d="M20 12H23.5C25 12 26 12.5 26 14C26 15.5 25 16 23.5 16H21.5L21 20H19.5L20 12ZM21.8 13.5L21.3 15H23C23.8 15 24.3 14.7 24.3 14.2C24.3 13.7 23.8 13.5 23 13.5H21.8Z" fill="#FFFFFF"/>
  </svg>
);

export const DockerIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Docker">
    <rect x="7" y="14" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <rect x="12" y="14" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <rect x="17" y="14" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <rect x="12" y="10" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <rect x="17" y="10" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <rect x="22" y="14" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <rect x="17" y="6" width="4" height="3" rx="0.5" fill="#2496ED"/>
    <path d="M1.5 19C3 18.5 6 18.5 7.5 19.5C9.5 20.8 12.5 20.8 14.5 19.5C16.5 18.2 19.5 18.2 21.5 19.5C23.5 20.8 26.5 20.5 28.5 18.5C29.5 19.5 30.5 21 30.5 22.5C30.5 26.5 26.5 29 20 29C11.5 29 3 26 1 21L1.5 19Z" fill="#2496ED"/>
    <circle cx="27.5" cy="15.5" r="0.8" fill="#2496ED"/>
  </svg>
);

export const GeminiIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Gemini AI">
    <defs>
      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1A73E8"/>
        <stop offset="50%" stopColor="#8AB4F8"/>
        <stop offset="100%" stopColor="#C586C0"/>
      </linearGradient>
    </defs>
    <path d="M16 2C16 9.7 9.7 16 2 16C9.7 16 16 22.3 16 30C16 22.3 22.3 16 30 16C22.3 16 16 9.7 16 2Z" fill="url(#geminiGrad)"/>
  </svg>
);

export const NextjsIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Next.js">
    <circle cx="16" cy="16" r="14" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5"/>
    <path d="M10 10V22L20.5 10.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 10V22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const RagIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="RAG Vector DB">
    <path d="M16 4L4 10V22L16 28L28 22V10L16 4Z" stroke="#81A1C1" strokeWidth="2" fill="none"/>
    <path d="M16 4V16M16 16L4 10M16 16L28 10M16 16V28" stroke="#81A1C1" strokeWidth="1.5"/>
    <circle cx="16" cy="16" r="3" fill="#88C0D0"/>
  </svg>
);

export const ShieldIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Zip-Slip Guard">
    <path d="M16 3L5 7V15C5 22.5 10 27.5 16 29C22 27.5 27 22.5 27 15V7L16 3Z" fill="#A3BE8C" opacity="0.2" stroke="#A3BE8C" strokeWidth="2"/>
    <path d="M11 15L15 19L21 12" stroke="#A3BE8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ShredderIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Shredder Cleanup">
    <rect x="5" y="8" width="22" height="6" rx="2" fill="#EBCB8B" stroke="#D08770" strokeWidth="1.5"/>
    <line x1="8" y1="17" x2="8" y2="25" stroke="#EBCB8B" strokeWidth="2" strokeDasharray="2 2"/>
    <line x1="13" y1="17" x2="13" y2="25" stroke="#EBCB8B" strokeWidth="2" strokeDasharray="2 2"/>
    <line x1="18" y1="17" x2="18" y2="25" stroke="#EBCB8B" strokeWidth="2" strokeDasharray="2 2"/>
    <line x1="23" y1="17" x2="23" y2="25" stroke="#EBCB8B" strokeWidth="2" strokeDasharray="2 2"/>
  </svg>
);

// Map of ecosystem keys to SVG components
export const ECOSYSTEM_ICON_MAP = {
  'node': NodeIcon,
  'nodejs': NodeIcon,
  'node.js': NodeIcon,
  'python': PythonIcon,
  'go': GoIcon,
  'golang': GoIcon,
  'rust': RustIcon,
  'java': JavaIcon,
  'ruby': RubyIcon,
  'php': PhpIcon,
  'docker': DockerIcon,
  'gemini': GeminiIcon,
  'rag': RagIcon,
  'nextjs': NextjsIcon,
  'next.js': NextjsIcon,
  'shield': ShieldIcon,
  'shredder': ShredderIcon,
};

export function EcosystemIcon({ name, size = 20, className = '' }) {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  const Component = ECOSYSTEM_ICON_MAP[key];
  if (!Component) return null;
  return <Component size={size} className={className} />;
}
