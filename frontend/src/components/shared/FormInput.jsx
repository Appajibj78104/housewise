import React from 'react';

const FormInput = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  theme = 'light',
  className = '',
  ...props 
}) => {
  const themes = {
    light: {
      label: 'text-gray-700',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-coral-500 focus:ring-coral-500',
      error: 'text-red-600'
    },
    dark: {
      label: 'text-gray-200',
      input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
      error: 'text-red-400'
    }
  };

  const currentTheme = themes[theme];

  return (
    <div className={className}>
      {label && (
        <label className={`block text-sm font-medium ${currentTheme.label} mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm 
          ${currentTheme.input}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-1 transition-colors
        `}
        {...props}
      />
      {error && (
        <p className={`mt-1 text-sm ${currentTheme.error}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
