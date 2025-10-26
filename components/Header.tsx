import React, { useState, useRef, useEffect } from 'react';
// FIX: Changed the import to use the direct 'animejs' mapping from the import map
// for better reliability and to resolve potential loading failures.
import anime from 'animejs';
import { NAV_ITEMS } from '../constants';
import type { NavItemKey } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const HamburgerIcon: React.FC = () => (
  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

interface HeaderProps {
  activeNavItem: NavItemKey;
}

const Header: React.FC<HeaderProps> = ({ activeNavItem }) => {
  const currentItem = NAV_ITEMS.find(item => item.key === activeNavItem);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinksRef = useRef<Map<NavItemKey, HTMLAnchorElement | null>>(new Map());
  const activeUnderlineRef = useRef<HTMLDivElement>(null);

  const handleMenuLinkClick = () => {
    setIsMenuOpen(false);
  }

  // Animation effect for the underline
  useEffect(() => {
    const activeLink = navLinksRef.current.get(activeNavItem);
    const underline = activeUnderlineRef.current;

    if (activeLink && underline) {
        // FIX: The imported `anime` is a module namespace instead of the function itself due to a module resolution issue.
        // The actual function is likely on the `default` property. This handles both cases.
        const animeFn = (anime as any).default || anime;
        animeFn({
            targets: underline,
            left: activeLink.offsetLeft,
            width: activeLink.offsetWidth,
            duration: 400,
            easing: 'easeOutQuint'
        });
    }
  }, [activeNavItem]);

  // Handle window resize to reposition underline without animation
  useEffect(() => {
    const handleResize = () => {
        const activeLink = navLinksRef.current.get(activeNavItem);
        const underline = activeUnderlineRef.current;
        if (activeLink && underline) {
            underline.style.left = `${activeLink.offsetLeft}px`;
            underline.style.width = `${activeLink.offsetWidth}px`;
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeNavItem]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <header className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-primary p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">AI SEO Studio</p>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1 relative">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                ref={el => { navLinksRef.current.set(item.key, el) }}
                href={`#/${item.key}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeNavItem === item.key
                    ? 'text-brand-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary'
                }`}
                aria-current={activeNavItem === item.key ? 'page' : undefined}
              >
                <span>{item.label}</span>
              </a>
            ))}
            <div
                ref={activeUnderlineRef}
                className="absolute bottom-0 h-0.5 bg-brand-primary"
                style={{ willChange: 'left, width' }}
            />
             <button onClick={toggleTheme} className="ml-4 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </nav>
          
          <div className="md:hidden flex items-center">
             <button onClick={toggleTheme} className="mr-2 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </header>
      </div>
      
      {isMenuOpen && (
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={`#/${item.key}`}
                onClick={handleMenuLinkClick}
                className={`block w-full px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 text-left ${
                  activeNavItem === item.key
                    ? 'text-brand-primary bg-gray-100 dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-current={activeNavItem === item.key ? 'page' : undefined}
              >
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentItem?.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{currentItem?.description}</p>
        </div>
      </div>
    </div>
  );
};
export default Header;