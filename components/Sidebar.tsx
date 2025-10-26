
import React from 'react';
import { NAV_ITEMS } from '../constants';
import type { NavItemKey } from '../types';

interface SidebarProps {
  activeNavItem: NavItemKey;
  setActiveNavItem: (item: NavItemKey) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeNavItem, setActiveNavItem }) => {
  return (
    <nav className="hidden md:flex flex-col w-64 bg-gray-800 p-4 space-y-2">
      <div className="flex items-center space-x-2 p-2 mb-4">
        <div className="bg-brand-primary p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h1 className="text-xl font-bold text-white">SEO Studio</h1>
      </div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveNavItem(item.key)}
          className={`flex items-center p-3 rounded-lg text-left text-sm font-medium transition-all duration-200 ${
            activeNavItem === item.key
              ? 'bg-brand-primary text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {/* FIX: Property 'icon' does not exist on type 'NavItem'. */}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
