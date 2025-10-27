import React, { useState, useEffect } from 'react';
import { optimizeContent } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertOptimizerResultToCSV } from '../utils/export';
import type { OptimizationResult, SavedOptimizerResult } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'savedOptimizerReports';

const OnPageOptimizer: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedOptimizerResult[]>([]);
  const { pushAction } = useHistory();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedReports(JSON.parse(stored));
      }
    } catch(e) {
      console.error("Failed to parse saved optimizer reports:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);


  const handleOptimize = async () => {
    if (!keyword || !content) {
      setError('Please enter a keyword and content to optimize.');
      return;
    }
    
    const prevState = { keyword, content, result, savedReports };

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const apiResult = await optimizeContent(keyword, content);
      
      const newSavedReport: SavedOptimizerResult = {
        id: Date.now(),
        keyword,
        content,
        timestamp: new Date().toISOString(),
        result: apiResult
      };
      const updatedSavedReports = [newSavedReport, ...savedReports];
      
      const redoAction = () => {
        setResult(apiResult);
        setSavedReports(updatedSavedReports);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedReports));
      };

      const undoAction = () => {
        setKeyword(prevState.keyword);
        setContent(prevState.content);
        setResult(prevState.result);
        setSavedReports(prevState.savedReports);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedReports));
      };
      
      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });
      
    } catch (e) {
      setError('Failed to optimize content. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: number) => {
    const reportToView = savedReports.find(r => r.id === id);
    if (reportToView) {
        setKeyword(reportToView.keyword);
        setContent(reportToView.content);
        setResult(reportToView.result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: number) => {
      const prevState = { savedReports };
      const updatedSavedReports = savedReports.filter(r => r.id !== id);

      const redoAction = () => {
        setSavedReports(updatedSavedReports);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedReports));
      };
      const undoAction = () => {
        setSavedReports(prevState.savedReports);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedReports));
      };
      
      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-500';
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-500';
  };

  return (
    <div className="space-y-6">
       <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mastering On-Page SEO</h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-3 prose prose-sm max-w-none dark:prose-invert">
          <p>On-page SEO involves optimizing the elements within your website's pages to improve their visibility and ranking in search results. This includes the content itself, as well as HTML elements like title tags, headings, and meta descriptions. Unlike off-page SEO, which involves external signals like backlinks, you have direct control over on-page factors. Fine-tuning these elements is a high-impact activity that can quickly improve your organic performance.</p>
          <p>This tool acts as your personal on-page SEO consultant. Simply paste your content and provide a target keyword, and our AI will analyze it against best practices. You'll receive an overall SEO score and specific, actionable recommendations for keyword usage, readability, metadata, and more. For a broader view of your site's health beyond a single page, try our comprehensive <Link to="/seoAudit" className="text-brand-primary hover:underline">AI Website SEO Audit</Link> tool.</p>
        </div>
      </Card>
      <Card>
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Analyze Your Content</h2>
        <div className="space-y-3">
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter target keyword"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your article content here..."
            rows={15}
          />
          <Button onClick={handleOptimize} isLoading={isLoading} className="w-full sm:w-auto">
            Optimize Content
          </Button>
        </div>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {result && (
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Optimization Report for "{keyword}"</h2>
            <ExportDropdown
              onExportJSON={() => exportAsJSON(result, `optimization-report-${keyword}`)}
              onExportCSV={() => {
                const csvString = convertOptimizerResultToCSV(result);
                exportAsCSV(csvString, `optimization-report-${keyword}`);
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Overall SEO Score</h3>
              <p className={`text-6xl font-bold mt-2 ${getScoreColor(result.seoScore)}`}>
                {result.seoScore}
                <span className="text-4xl text-gray-400 dark:text-gray-500">/100</span>
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Keyword Density</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{result.keywordDensity}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Readability</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{result.readability}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Title & Headings</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{result.titleAndHeadings}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Meta Description</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{result.metaDescription}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Internal/External Linking</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{result.linking}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {savedReports.length > 0 && (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saved Reports</h2>
            <div className="mt-4 space-y-3">
                {savedReports.map(saved => (
                    <div key={saved.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{saved.keyword}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(saved.timestamp).toLocaleString()}</p>
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

export default OnPageOptimizer;
