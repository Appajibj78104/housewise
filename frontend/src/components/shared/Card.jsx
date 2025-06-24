import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  theme = 'light', 
  padding = 'p-6',
  shadow = 'shadow-sm',
  hover = false 
}) => {
  const themes = {
    light: 'bg-white border border-gray-200',
    dark: 'bg-gray-800 border border-gray-700',
    transparent: 'bg-transparent'
  };

  const hoverEffect = hover ? 'hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div className={`
      ${themes[theme]} 
      ${padding} 
      ${shadow} 
      ${hoverEffect}
      rounded-lg 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
