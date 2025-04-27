import React from 'react';

export const readingThemes = {
  light: {
    label: 'Light',
    background: 'bg-neutral-50',
    text: 'text-gray-900',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
  },
  sepia: {
    label: 'Sepia',
    background: 'bg-[#f4ecd8]',
    text: 'text-[#5b4636]',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-100',
  },
  dark: {
    label: 'Dark',
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-800',
  },
  night: {
    label: 'Night',
    background: 'bg-black',
    text: 'text-[#c4c4c4]',
    border: 'border-gray-800',
    hover: 'hover:bg-gray-900',
  },
  green: {
    label: 'Green',
    background: 'bg-[#e8f5e9]',
    text: 'text-[#1b5e20]',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
  },
  blue: {
    label: 'Blue',
    background: 'bg-[#e3f2fd]',
    text: 'text-[#0d47a1]',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
  }
};

const ReadingThemes = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {Object.entries(readingThemes).map(([themeKey, theme]) => (
        <button
          key={themeKey}
          onClick={() => onThemeChange(themeKey)}
          className={`
            p-4 rounded-lg border transition-all duration-200
            ${theme.background} ${theme.text} ${theme.border}
            ${currentTheme === themeKey ? 'ring-2 ring-blue-500' : ''}
            ${theme.hover}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{theme.label}</span>
            {currentTheme === themeKey && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="mt-2 text-sm opacity-75">Aa</div>
        </button>
      ))}
    </div>
  );
};

export default ReadingThemes; 