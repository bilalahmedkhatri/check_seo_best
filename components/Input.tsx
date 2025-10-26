import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${className}`}
      {...props}
    />
  );
};

export default Input;