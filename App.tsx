
import React, { useState, useEffect } from 'react';
import KeywordResearch from './components/KeywordResearch';
import SERPMonitoring from './components/SERPMonitoring';
import ContentBrief from './components/ContentBrief';
import OnPageOptimizer from './components/OnPageOptimizer';
import KeywordStrategist from './components/KeywordStrategist';
import SEOAudit from './components/SEOAudit';
import Header from './components/Header';
import Footer from './components/Footer';
import { NAV_ITEMS } from './constants';
import type { NavItemKey } from './types';

const getNavItemKeyFromHash = (): NavItemKey => {
  const hash = window.location.hash.substring(2); // Remove #/
  const isValidKey = NAV_ITEMS.some(item => item.key === hash);
  return isValidKey ? hash as NavItemKey : NAV_ITEMS[0].key;
};


const App: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = useState<NavItemKey>(getNavItemKeyFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setActiveNavItem(getNavItemKeyFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial route if hash is empty or invalid, which triggers a hashchange
    if (getNavItemKeyFromHash() === NAV_ITEMS[0].key && window.location.hash.substring(2) !== NAV_ITEMS[0].key) {
      window.location.hash = `/${NAV_ITEMS[0].key}`;
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Effect to update head tags (title, meta description) for SEO
  useEffect(() => {
    const currentItem = NAV_ITEMS.find(item => item.key === activeNavItem);
    if (currentItem) {
      document.title = `${currentItem.title} | AI SEO Studio`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', currentItem.description);
    }
  }, [activeNavItem]);

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
      case 'seoAudit':
        return <SEOAudit />;
      default:
        return <KeywordResearch />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Header activeNavItem={activeNavItem} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 w-full mx-auto max-w-6xl">
        {renderActiveComponent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;