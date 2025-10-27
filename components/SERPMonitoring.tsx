import React, { useState, useEffect } from 'react';
import { analyzeSERP, findCompetitorKeywords } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertSERPToCSV, convertCompetitorKeywordsToCSV } from '../utils/export';
import type { SERPAnalysis, SavedSERPResult, CompetitorKeywordAnalysisResult, SavedCompetitorKeywordResult } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_SERP_KEY = 'savedSerpAnalyses';
const LOCAL_STORAGE_COMPETITOR_KEY = 'savedCompetitorKeywordAnalyses';

const SERPMonitoring: React.FC = () => {
  // State for SERP Analysis
  const [keyword, setKeyword] = useState('');
  const [userDomain, setUserDomain] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SERPAnalysis | null>(null);
  const [isSerpLoading, setIsSerpLoading] = useState(false);
  const [serpError, setSerpError] = useState<string | null>(null);
  const [savedSerpResults, setSavedSerpResults] = useState<SavedSERPResult[]>([]);

  // State for Competitor Keyword Discovery
  const [competitorDomain, setCompetitorDomain] = useState('');
  const [competitorResult, setCompetitorResult] = useState<CompetitorKeywordAnalysisResult | null>(null);
  const [isCompetitorLoading, setIsCompetitorLoading] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [savedCompetitorResults, setSavedCompetitorResults] = useState<SavedCompetitorKeywordResult[]>([]);
  
  const { pushAction } = useHistory();


  useEffect(() => {
    try {
      const storedSerp = localStorage.getItem(LOCAL_STORAGE_SERP_KEY);
      if (storedSerp) setSavedSerpResults(JSON.parse(storedSerp));

      const storedCompetitor = localStorage.getItem(LOCAL_STORAGE_COMPETITOR_KEY);
      if (storedCompetitor) setSavedCompetitorResults(JSON.parse(storedCompetitor));
    } catch (e) {
      console.error("Failed to parse saved results from localStorage:", e);
      localStorage.removeItem(LOCAL_STORAGE_SERP_KEY);
      localStorage.removeItem(LOCAL_STORAGE_COMPETITOR_KEY);
    }
  }, []);

  const handleAnalyzeSERP = async () => {
    if (!keyword || !userDomain) {
      setSerpError('Please enter both a keyword and your domain.');
      return;
    }
    
    const prevState = { keyword, userDomain, analysisResult, savedSerpResults };

    setIsSerpLoading(true);
    setSerpError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeSERP(keyword, userDomain);

      const newSavedResult: SavedSERPResult = {
        id: Date.now(),
        keyword,
        domain: userDomain,
        timestamp: new Date().toISOString(),
        result,
      };
      const updatedSavedResults = [newSavedResult, ...savedSerpResults];
      
      const redoAction = () => {
        setAnalysisResult(result);
        setSavedSerpResults(updatedSavedResults);
        localStorage.setItem(LOCAL_STORAGE_SERP_KEY, JSON.stringify(updatedSavedResults));
      };

      const undoAction = () => {
        setKeyword(prevState.keyword);
        setUserDomain(prevState.userDomain);
        setAnalysisResult(prevState.analysisResult);
        setSavedSerpResults(prevState.savedSerpResults);
        localStorage.setItem(LOCAL_STORAGE_SERP_KEY, JSON.stringify(prevState.savedSerpResults));
      };
      
      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });

    } catch (e) {
      const err = e as Error;
      setSerpError(err.message || 'Failed to analyze SERP. Please try again.');
      console.error(e);
    } finally {
      setIsSerpLoading(false);
    }
  };

  const handleAnalyzeCompetitor = async () => {
    if(!competitorDomain) {
        setCompetitorError('Please enter a competitor domain.');
        return;
    }

    const prevState = { competitorDomain, competitorResult, savedCompetitorResults };

    setIsCompetitorLoading(true);
    setCompetitorError(null);
    setCompetitorResult(null);
    try {
        const result = await findCompetitorKeywords(competitorDomain);

        const newSavedResult: SavedCompetitorKeywordResult = {
          id: Date.now(),
          domain: competitorDomain,
          timestamp: new Date().toISOString(),
          result,
        };
        const updatedSavedResults = [newSavedResult, ...savedCompetitorResults];
        
        const redoAction = () => {
          setCompetitorResult(result);
          setSavedCompetitorResults(updatedSavedResults);
          localStorage.setItem(LOCAL_STORAGE_COMPETITOR_KEY, JSON.stringify(updatedSavedResults));
        };

        const undoAction = () => {
          setCompetitorDomain(prevState.competitorDomain);
          setCompetitorResult(prevState.competitorResult);
          setSavedCompetitorResults(prevState.savedCompetitorResults);
          localStorage.setItem(LOCAL_STORAGE_COMPETITOR_KEY, JSON.stringify(prevState.savedCompetitorResults));
        };

        redoAction();
        pushAction({ undo: undoAction, redo: redoAction });

    } catch (e) {
        const err = e as Error;
        setCompetitorError(err.message || 'Failed to find competitor keywords.');
        console.error(e);
    } finally {
        setIsCompetitorLoading(false);
    }
  }

  const handleViewSERP = (id: number) => {
    const resultToView = savedSerpResults.find(r => r.id === id);
    if (resultToView) {
      setKeyword(resultToView.keyword);
      setUserDomain(resultToView.domain);
      setAnalysisResult(resultToView.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteSERP = (id: number) => {
    const prevState = { savedSerpResults };
    const updatedSavedResults = savedSerpResults.filter(r => r.id !== id);
    
    const redoAction = () => {
      setSavedSerpResults(updatedSavedResults);
      localStorage.setItem(LOCAL_STORAGE_SERP_KEY, JSON.stringify(updatedSavedResults));
    };
    const undoAction = () => {
      setSavedSerpResults(prevState.savedSerpResults);
      localStorage.setItem(LOCAL_STORAGE_SERP_KEY, JSON.stringify(prevState.savedSerpResults));
    };

    redoAction();
    pushAction({ undo: undoAction, redo: redoAction });
  };

  const handleViewCompetitor = (id: number) => {
    const resultToView = savedCompetitorResults.find(r => r.id === id);
    if (resultToView) {
        setCompetitorDomain(resultToView.domain);
        setCompetitorResult(resultToView.result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteCompetitor = (id: number) => {
    const prevState = { savedCompetitorResults };
    const updatedSavedResults = savedCompetitorResults.filter(r => r.id !== id);

    const redoAction = () => {
      setSavedCompetitorResults(updatedSavedResults);
      localStorage.setItem(LOCAL_STORAGE_COMPETITOR_KEY, JSON.stringify(updatedSavedResults));
    };
    const undoAction = () => {
      setSavedCompetitorResults(prevState.savedCompetitorResults);
      localStorage.setItem(LOCAL_STORAGE_COMPETITOR_KEY, JSON.stringify(prevState.savedCompetitorResults));
    };
    
    redoAction();
    pushAction({ undo: undoAction, redo: redoAction });
  };


  return (
    <div className="space-y-6">
       <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What is SERP Analysis?</h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-3 prose prose-sm max-w-none dark:prose-invert">
          <p>A Search Engine Results Page (SERP) is what you see after you search for something on Google. Analyzing the SERP for your target keywords is critical for understanding the competitive landscape. It reveals who is currently ranking, what kind of content they are creating, and the search intent behind the query. This information is vital for crafting a strategy to reach the top positions.</p>
          <p>This tool provides two powerful functions. First, you can analyze the SERP for a specific keyword to see the top 5 competitors and get AI-powered recommendations tailored to your domain. Second, you can perform keyword discovery on a competitor's domain to uncover the terms they rank for. This intelligence can inform your own <Link to="/contentBrief" className="text-brand-primary hover:underline">content briefs</Link> and help you find gaps in their strategy. A full <Link to="/seoAudit" className="text-brand-primary hover:underline">SEO Audit</Link> can also provide a deeper technical overview of your own site.</p>
        </div>
      </Card>
      {/* SERP Analysis Section */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Analyze SERP for a Keyword</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter target keyword"
            className="flex-grow"
          />
          <Input
            type="text"
            value={userDomain}
            onChange={(e) => setUserDomain(e.target.value)}
            placeholder="Enter your domain (e.g., yoursite.com)"
            className="flex-grow"
          />
          <Button onClick={handleAnalyzeSERP} isLoading={isSerpLoading}>
            Analyze SERP
          </Button>
        </div>
        {serpError && <p className="text-red-500 mt-3">{serpError}</p>}
      </Card>

      {isSerpLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}

      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top 5 Competitors for "{keyword}"</h2>
              <ExportDropdown
                onExportJSON={() => exportAsJSON(analysisResult, `serp-analysis-${keyword}`)}
                onExportCSV={() => exportAsCSV(convertSERPToCSV(analysisResult), `serp-analysis-${keyword}`)}
              />
            </div>
            <div className="space-y-4">
              {analysisResult.competitors?.map((comp, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    <a href={comp.url} target="_blank" rel="noopener noreferrer">{comp.title}</a>
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500 truncate">{comp.url}</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{comp.description}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Expert Analysis for "{userDomain}"</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{analysisResult.analysis}</p>
          </Card>
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SEO Recommendations</h2>
            <ul className="list-disc list-inside space-y-2">
              {analysisResult.recommendations?.map((rec, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-300">{rec}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Competitor Keyword Discovery Section */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Competitor Keyword Discovery</h2>
        <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={competitorDomain}
              onChange={(e) => setCompetitorDomain(e.target.value)}
              placeholder="Enter competitor domain (e.g., rivalsite.com)"
              className="flex-grow"
            />
            <Button onClick={handleAnalyzeCompetitor} isLoading={isCompetitorLoading}>
              Find Keywords
            </Button>
        </div>
        {competitorError && <p className="text-red-500 mt-3">{competitorError}</p>}
      </Card>
      
      {isCompetitorLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}

      {competitorResult && (
        <Card>
           <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Keywords for "{competitorDomain}"</h2>
              <ExportDropdown
                onExportJSON={() => exportAsJSON(competitorResult, `competitor-keywords-${competitorDomain}`)}
                onExportCSV={() => exportAsCSV(convertCompetitorKeywordsToCSV(competitorResult), `competitor-keywords-${competitorDomain}`)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3">Keyword</th>
                    <th scope="col" className="px-4 py-3">Est. Rank</th>
                    <th scope="col" className="px-4 py-3">Est. Search Volume</th>
                    <th scope="col" className="px-4 py-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorResult.map((kw, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <th scope="row" className="px-4 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{kw.keyword}</th>
                      <td className="px-4 py-4">{kw.rank}</td>
                      <td className="px-4 py-4">{kw.searchVolume}</td>
                      <td className="px-4 py-4">{kw.difficulty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </Card>
      )}

      {/* Saved Analyses Section */}
      {(savedSerpResults.length > 0 || savedCompetitorResults.length > 0) && (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saved Analyses</h2>
            {savedSerpResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">SERP Analyses</h3>
                <div className="space-y-3">
                    {savedSerpResults.map(saved => (
                        <div key={saved.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{saved.keyword}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(saved.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <Button onClick={() => handleViewSERP(saved.id)} className="text-sm">View</Button>
                                <Button onClick={() => handleDeleteSERP(saved.id)} className="text-sm !bg-red-600 hover:!bg-red-700 dark:!bg-red-700 dark:hover:!bg-red-800">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}
            {savedCompetitorResults.length > 0 && (
               <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Competitor Keywords</h3>
                 <div className="space-y-3">
                    {savedCompetitorResults.map(saved => (
                        <div key={saved.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{saved.domain}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(saved.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <Button onClick={() => handleViewCompetitor(saved.id)} className="text-sm">View</Button>
                                <Button onClick={() => handleDeleteCompetitor(saved.id)} className="text-sm !bg-red-600 hover:!bg-red-700 dark:!bg-red-700 dark:hover:!bg-red-800">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
               </div>
            )}
        </Card>
      )}
    </div>
  );
};

export default SERPMonitoring;
