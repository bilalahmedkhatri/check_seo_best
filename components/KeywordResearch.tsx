import React, { useState, useEffect } from 'react';
import { generateKeywords } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertKeywordsToCSV } from '../utils/export';
import type { Keywords, SavedKeywordResult } from '../types';

const LOCAL_STORAGE_KEY = 'savedKeywordAnalyses';

const KeywordResearch: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<Keywords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<SavedKeywordResult[]>([]);

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
    setIsLoading(true);
    setError(null);
    setKeywords(null);
    try {
      const result = await generateKeywords(topic);
      setKeywords(result);
      
      const newSavedResult: SavedKeywordResult = {
        id: Date.now(),
        topic: topic,
        timestamp: new Date().toISOString(),
        result: result,
      };
      const updatedSavedResults = [newSavedResult, ...savedResults];
      setSavedResults(updatedSavedResults);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedResults));

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
      const updatedSavedResults = savedResults.filter(r => r.id !== id);
      setSavedResults(updatedSavedResults);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedResults));
  };


  const renderKeywordList = (title: string, keywords: string[] | undefined) => {
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return null;
    }
    return (
      <div key={title}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">{title}</h3>
        <ul className="list-disc list-inside space-y-1">
          {keywords.map((kw, index) => (
            <li key={index} className="text-gray-600 dark:text-gray-300">{kw}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
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