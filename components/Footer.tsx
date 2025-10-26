import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="w-full mx-auto max-w-6xl py-4 px-4 sm:px-6 md:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} SEO Studio. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;