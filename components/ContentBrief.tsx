import React, { useState, useEffect } from 'react';
import { createContentBrief } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertContentBriefToCSV } from '../utils/export';
import type { ContentBriefData, SavedContentBriefResult } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'savedContentBriefs';

const ContentBrief: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [brief, setBrief] = useState<ContentBriefData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedBriefs, setSavedBriefs] = useState<SavedContentBriefResult[]>([]);
  const { pushAction } = useHistory();

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

    const prevState = { keyword, brief, savedBriefs };

    setIsLoading(true);
    setError(null);
    setBrief(null);
    try {
      const result = await createContentBrief(keyword);

      const newSavedBrief: SavedContentBriefResult = {
        id: Date.now(),
        keyword,
        timestamp: new Date().toISOString(),
        result,
      };
      const updatedSavedBriefs = [newSavedBrief, ...savedBriefs];
      
      const redoAction = () => {
        setBrief(result);
        setSavedBriefs(updatedSavedBriefs);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedBriefs));
      };

      const undoAction = () => {
        setKeyword(prevState.keyword);
        setBrief(prevState.brief);
        setSavedBriefs(prevState.savedBriefs);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedBriefs));
      };

      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });

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
      const prevState = { savedBriefs };
      const updatedSavedBriefs = savedBriefs.filter(b => b.id !== id);
      
      const redoAction = () => {
        setSavedBriefs(updatedSavedBriefs);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedBriefs));
      };
      const undoAction = () => {
        setSavedBriefs(prevState.savedBriefs);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedBriefs));
      };

      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });
  };


  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">The Power of a Great Content Brief</h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-3 prose prose-sm max-w-none dark:prose-invert">
          <p>A content brief is a detailed set of instructions for a writer creating a piece of content. It acts as a blueprint, ensuring the final article is perfectly aligned with your SEO goals, target audience, and brand voice. Creating a thorough brief is the most effective way to scale content production without sacrificing quality or ranking potential. It bridges the gap between your SEO strategy and the creative writing process.</p>
          <p>This tool automates the creation of SEO-focused content briefs. Just provide a target keyword, and our AI will generate a comprehensive plan, including a suggested title, meta description, a detailed outline with headings, LSI keywords, and more. This saves you hours of manual research and empowers your writers to create high-quality content that performs. Once your content is written, be sure to run it through our <Link to="/onPageOptimizer" className="text-brand-primary hover:underline">On-Page Optimizer</Link> for a final check.</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Generate a New Content Brief</h2>
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
