import React, { useState, useEffect } from 'react';
import { generateKeywords } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertKeywordsToCSV } from '../utils/export';
import type { Keywords, SavedKeywordResult, KeywordWithVolume } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'savedKeywordAnalyses';

const KeywordResearch: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<Keywords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<SavedKeywordResult[]>([]);
  const { pushAction } = useHistory();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved keyword results:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    
    const prevState = { topic, keywords, savedResults };

    setIsLoading(true);
    setError(null);
    setKeywords(null);
    try {
      const result = await generateKeywords(topic);
      
      const newSavedResult: SavedKeywordResult = {
        id: Date.now(),
        topic: topic,
        timestamp: new Date().toISOString(),
        result: result,
      };
      const updatedSavedResults = [newSavedResult, ...savedResults];
      
      const redoAction = () => {
        setKeywords(result);
        setSavedResults(updatedSavedResults);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedResults));
      };

      const undoAction = () => {
        setTopic(prevState.topic);
        setKeywords(prevState.keywords);
        setSavedResults(prevState.savedResults);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedResults));
      };

      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });

    } catch (e) {
      setError('Failed to generate keywords. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: number) => {
    const resultToView = savedResults.find(r => r.id === id);
    if (resultToView) {
        setTopic(resultToView.topic);
        setKeywords(resultToView.result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: number) => {
      const prevState = { savedResults };
      const updatedSavedResults = savedResults.filter(r => r.id !== id);
      
      const redoAction = () => {
        setSavedResults(updatedSavedResults);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedResults));
      };
      
      const undoAction = () => {
        setSavedResults(prevState.savedResults);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedResults));
      };

      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });
  };


  const renderKeywordList = (title: string, keywords: KeywordWithVolume[] | undefined) => {
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return null;
    }
    return (
      <div key={title}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">{title}</h3>
        <ul className="space-y-2">
          {keywords.map((kw, index) => (
            <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
              <span>{kw.keyword}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{kw.searchVolume}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Understanding Keyword Research</h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-3 prose prose-sm max-w-none dark:prose-invert">
          <p>Keyword research is the cornerstone of any successful SEO strategy. It is the process of finding and analyzing the terms people use to search for information, products, or services online. By understanding these queries, you can create targeted content that meets user needs and drives organic traffic to your website. Effective keyword research allows you to get inside the head of your target audience.</p>
          <p>This tool helps you automate that process. Simply enter a broad topic, and our AI will generate lists of primary keywords, long-tail variations, and common questions your audience is asking. Use these insights to brainstorm content ideas, optimize existing pages, and build a content plan that covers your entire niche. For a more structured approach, consider using our <Link to="/keywordStrategist" className="text-brand-primary hover:underline">AI Keyword Strategist</Link> to organize these keywords into powerful topic clusters.</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Generate New Keywords</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., 'vegan baking')"
            className="flex-grow"
          />
          <Button onClick={handleGenerate} isLoading={isLoading}>
            Generate Keywords
          </Button>
        </div>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {keywords && (
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyword Results for "{topic}"</h2>
            <ExportDropdown
              onExportJSON={() => exportAsJSON(keywords, `keyword-research-${topic}`)}
              onExportCSV={() => {
                const csvString = convertKeywordsToCSV(keywords);
                exportAsCSV(csvString, `keyword-research-${topic}`);
              }}
            />
          </div>
          {renderKeywordList('Primary Keywords', keywords.primaryKeywords)}
          {renderKeywordList('Long-Tail Keywords', keywords.longTailKeywords)}
          {renderKeywordList('Question-Based Keywords', keywords.questionBasedKeywords)}
          {renderKeywordList('LSI Keywords', keywords.lsiKeywords)}
        </Card>
      )}

      {savedResults.length > 0 && (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saved Analyses</h2>
            <div className="mt-4 space-y-3">
                {savedResults.map(saved => (
                    <div key={saved.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{saved.topic}</p>
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

export default KeywordResearch;
