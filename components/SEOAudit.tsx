import React, { useState, useEffect } from 'react';
import { auditSEO } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertSEOAuditToCSV } from '../utils/export';
import type { SEOAuditResult, SavedSEOAuditResult, AuditCheck } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'savedSeoAudits';

const SEOAudit: React.FC = () => {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<SEOAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAudits, setSavedAudits] = useState<SavedSEOAuditResult[]>([]);
  const { pushAction } = useHistory();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedAudits(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved SEO audits:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleRunAudit = async () => {
    if (!url || !keyword) {
      setError('Please enter both a URL and a focus keyword.');
      return;
    }
    
    const prevState = { url, keyword, result, savedAudits };

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const auditResult = await auditSEO(url, keyword);

      const newSavedAudit: SavedSEOAuditResult = {
        id: Date.now(),
        url,
        keyword,
        timestamp: new Date().toISOString(),
        result: auditResult,
      };
      const updatedSavedAudits = [newSavedAudit, ...savedAudits];
      
      const redoAction = () => {
        setResult(auditResult);
        setSavedAudits(updatedSavedAudits);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedAudits));
      };
      
      const undoAction = () => {
        setUrl(prevState.url);
        setKeyword(prevState.keyword);
        setResult(prevState.result);
        setSavedAudits(prevState.savedAudits);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedAudits));
      };

      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });

    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to run SEO audit. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: number) => {
    const auditToView = savedAudits.find(a => a.id === id);
    if (auditToView) {
      setUrl(auditToView.url);
      setKeyword(auditToView.keyword);
      setResult(auditToView.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: number) => {
    const prevState = { savedAudits };
    const updatedSavedAudits = savedAudits.filter(a => a.id !== id);
    
    const redoAction = () => {
      setSavedAudits(updatedSavedAudits);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedAudits));
    };

    const undoAction = () => {
      setSavedAudits(prevState.savedAudits);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedAudits));
    };
    
    redoAction();
    pushAction({ undo: undoAction, redo: redoAction });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-500';
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-500';
  };
  
  const getStatusIcon = (status: AuditCheck['status']) => {
    switch(status) {
      case 'Pass':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
      case 'Fail':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
      case 'Warning':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.001-1.742 3.001H4.42c-1.522 0-2.492-1.667-1.742-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
    }
  }

  const renderAuditSection = (title: string, checks: AuditCheck[] | undefined) => {
    if (!checks || checks.length === 0) return null;
    return (
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <div className="space-y-4">
          {checks.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-0.5">{getStatusIcon(item.status)}</div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.check}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Conducting a Website SEO Audit</h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-3 prose prose-sm max-w-none dark:prose-invert">
          <p>A website SEO audit is a comprehensive health check for your site. It involves analyzing various factors that impact your ability to rank in search engines, including technical aspects, on-page elements, and content quality. Regularly auditing your site helps you identify and fix issues that could be holding you back from achieving higher rankings, better traffic, and more conversions. It is a proactive way to maintain and improve your site's SEO performance over time.</p>
          <p>Our AI-powered audit tool simplifies this complex process. Enter your URL and a focus keyword, and the tool will perform a detailed analysis of on-page SEO, content quality, and key technical areas. You'll receive an overall score and a prioritized list of actionable recommendations. While this audit focuses on a single page, you can use the <Link to="/serpMonitoring" className="text-brand-primary hover:underline">SERP Monitoring</Link> tool to analyze your competitors' pages and find more opportunities.</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Start a New Audit</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to audit (e.g., https://yoursite.com)"
            className="flex-grow"
          />
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter focus keyword"
            className="flex-grow"
          />
          <Button onClick={handleRunAudit} isLoading={isLoading}>
            Run Audit
          </Button>
        </div>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </Card>

      {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}

      {result && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Report for "{url}"</h2>
              <ExportDropdown
                onExportJSON={() => exportAsJSON(result, `seo-audit-${keyword}`)}
                onExportCSV={() => exportAsCSV(convertSEOAuditToCSV(result), `seo-audit-${keyword}`)}
              />
            </div>
             <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Overall SEO Score</h3>
              <p className={`text-6xl font-bold mt-2 ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
                <span className="text-4xl text-gray-400 dark:text-gray-500">/100</span>
              </p>
            </div>
          </Card>
          
          {renderAuditSection('On-Page SEO', result.onPageSeo)}
          {renderAuditSection('Content Quality', result.contentQuality)}
          {renderAuditSection('Technical SEO', result.technicalSeo)}

        </div>
      )}

      {savedAudits.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saved Audits</h2>
          <div className="mt-4 space-y-3">
            {savedAudits.map(saved => (
              <div key={saved.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={saved.url}>{saved.url}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Keyword: {saved.keyword} | {new Date(saved.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={() => handleView(saved.id)} className="text-sm">View</Button>
                  <Button onClick={() => handleDelete(saved.id)} className="text-sm !bg-red-600 hover:!bg-red-700 dark:!bg-red-700 dark:hover:!bg-red-800">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SEOAudit;
