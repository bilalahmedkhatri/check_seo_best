import React, { useState, useEffect } from 'react';
import { createContentBrief } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertContentBriefToCSV } from '../utils/export';
import type { ContentBriefData, SavedContentBriefResult } from '../types';

const LOCAL_STORAGE_KEY = 'savedContentBriefs';

const ContentBrief: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [brief, setBrief] = useState<ContentBriefData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedBriefs, setSavedBriefs] = useState<SavedContentBriefResult[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedBriefs(JSON.parse(stored));
      }
    } catch(e) {
      console.error("Failed to parse saved content briefs:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleCreateBrief = async () => {
    if (!keyword) {
      setError('Please enter a target keyword.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setBrief(null);
    try {
      const result = await createContentBrief(keyword);
      setBrief(result);

      const newSavedBrief: SavedContentBriefResult = {
        id: Date.now(),
        keyword,
        timestamp: new Date().toISOString(),
        result,
      };
      const updatedSavedBriefs = [newSavedBrief, ...savedBriefs];
      setSavedBriefs(updatedSavedBriefs);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedBriefs));

    } catch (e) {
      setError('Failed to create content brief. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: number) => {
    const briefToView = savedBriefs.find(b => b.id === id);
    if (briefToView) {
        setKeyword(briefToView.keyword);
        setBrief(briefToView.result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: number) => {
      const updatedSavedBriefs = savedBriefs.filter(b => b.id !== id);
      setSavedBriefs(updatedSavedBriefs);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedBriefs));
  };


  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter target keyword for the article"
            className="flex-grow"
          />
          <Button onClick={handleCreateBrief} isLoading={isLoading}>
            Create Brief
          </Button>
        </div>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {brief && (
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Brief for "{keyword}"</h2>
            <ExportDropdown
              onExportJSON={() => exportAsJSON(brief, `content-brief-${keyword}`)}
              onExportCSV={() => {
                const csvString = convertContentBriefToCSV(brief);
                exportAsCSV(csvString, `content-brief-${keyword}`);
              }}
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Title Suggestion</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{brief.titleSuggestion}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meta Description Suggestion</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{brief.metaDescriptionSuggestion}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Audience</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{brief.targetAudience}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Suggested Word Count</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{brief.suggestedWordCount}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LSI Keywords</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {brief.lsiKeywords && Array.isArray(brief.lsiKeywords) && brief.lsiKeywords.map((kw, index) => (
                  <span key={index} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium px-2.5 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Article Outline</h3>
              <div className="mt-2 space-y-3">
                {brief.outline && Array.isArray(brief.outline) && brief.outline.map((section, index) => (
                  <div key={index}>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">H2: {section.heading}</h4>
                    {section.subheadings && Array.isArray(section.subheadings) && (
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        {section.subheadings.map((sub, subIndex) => (
                          <li key={subIndex} className="text-gray-600 dark:text-gray-300">H3: {sub}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {savedBriefs.length > 0 && (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saved Briefs</h2>
            <div className="mt-4 space-y-3">
                {savedBriefs.map(saved => (
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

export default ContentBrief;