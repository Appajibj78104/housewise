import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  theme = 'light', 
  text = '',
  fullScreen = false 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const themes = {
    light: {
      spinner: 'border-coral-500',
      text: 'text-gray-600',
      bg: 'bg-gray-50'
    },
    dark: {
      spinner: 'border-blue-500',
      text: 'text-gray-300',
      bg: 'bg-gray-900'
    }
  };

  const currentTheme = themes[theme];
  const sizeClass = sizes[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClass} border-b-2 ${currentTheme.spinner}`} />
      {text && (
        <p className={`mt-4 text-sm ${currentTheme.text}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme.bg}`}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
