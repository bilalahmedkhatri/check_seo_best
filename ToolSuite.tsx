
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { useHistory } from './contexts/HistoryContext';

const ToolSuite: React.FC = () => {
  const location = useLocation();
  const { clearHistory } = useHistory();

  const currentPathKey = location.pathname.substring(1);
  const isValidKey = NAV_ITEMS.some(item => item.key === currentPathKey);
  const activeNavItem: NavItemKey = isValidKey ? currentPathKey as NavItemKey : NAV_ITEMS[0].key;

  useEffect(() => {
    // Clear undo/redo history on page navigation
    clearHistory();
  }, [location.pathname, clearHistory]);

  // Effect to update head tags (title, meta description, canonical) for SEO
  useEffect(() => {
    const currentItem = NAV_ITEMS.find(item => item.key === activeNavItem);
    const BASE_URL = window.location.origin;

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

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    const path = location.pathname === '/' ? `/${NAV_ITEMS[0].key}` : location.pathname;
    canonicalLink.setAttribute('href', `${BASE_URL}${path}`);

  }, [activeNavItem, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Header activeNavItem={activeNavItem} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 w-full mx-auto max-w-6xl">
        <Routes>
          <Route path="/keywordResearch" element={<KeywordResearch />} />
          <Route path="/serpMonitoring" element={<SERPMonitoring />} />
          <Route path="/contentBrief" element={<ContentBrief />} />
          <Route path="/onPageOptimizer" element={<OnPageOptimizer />} />
          <Route path="/keywordStrategist" element={<KeywordStrategist />} />
          <Route path="/seoAudit" element={<SEOAudit />} />
          <Route path="*" element={<Navigate to={`/${NAV_ITEMS[0].key}`} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default ToolSuite;
