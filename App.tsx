import React, { useState } from 'react';
import KeywordResearch from './components/KeywordResearch';
import SERPMonitoring from './components/SERPMonitoring';
import ContentBrief from './components/ContentBrief';
import OnPageOptimizer from './components/OnPageOptimizer';
import KeywordStrategist from './components/KeywordStrategist';
import Header from './components/Header';
import Footer from './components/Footer';
import { NAV_ITEMS } from './constants';
import type { NavItemKey } from './types';

const App: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = useState<NavItemKey>(NAV_ITEMS[0].key);

  const renderActiveComponent = () => {
    switch (activeNavItem) {
      case 'keywordResearch':
        return <KeywordResearch />;
      case 'serpMonitoring':
        return <SERPMonitoring />;
      case 'contentBrief':
        return <ContentBrief />;
      case 'onPageOptimizer':
        return <OnPageOptimizer />;
      case 'keywordStrategist':
        return <KeywordStrategist />;
      default:
        return <KeywordResearch />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Header activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 w-full mx-auto max-w-6xl">
        {renderActiveComponent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
