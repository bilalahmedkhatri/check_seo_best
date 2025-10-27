import React, { useState, useEffect } from 'react';
import { generateKeywordStrategy, generateTopicClusters } from '../services/geminiService';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import Textarea from './Textarea';
import LoadingSpinner from './LoadingSpinner';
import ExportDropdown from './ExportDropdown';
import { exportAsJSON, exportAsCSV, convertKeywordStrategyToCSV } from '../utils/export';
import type { KeywordStrategyResult, TopicClusterResult, SavedKeywordStrategyResult, KeywordWithDescription } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'savedKeywordStrategies';

const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
    <div
      className="bg-brand-primary h-2.5 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    ></div>
  </div>
);

const KeywordStrategist: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1 state
  const [goal, setGoal] = useState('Increase Website Traffic');
  const [audience, setAudience] = useState('');
  const [seedKeywords, setSeedKeywords] = useState('');
  
  // Step 2 state
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordStrategyResult | null>(null);
  
  // Step 3 state
  const [topicClusters, setTopicClusters] = useState<TopicClusterResult | null>(null);

  const [savedStrategies, setSavedStrategies] = useState<SavedKeywordStrategyResult[]>([]);
  const { pushAction } = useHistory();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedStrategies(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved keyword strategies:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleStep1Submit = async () => {
    if (!audience || !seedKeywords) {
      setError('Please describe your audience and provide at least one seed keyword.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateKeywordStrategy(goal, audience, seedKeywords);
      setKeywordAnalysis(result);
      setStep(2);
    } catch (e) {
      setError('Failed to generate keyword ideas. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStep2Submit = async () => {
    if (!keywordAnalysis) return;

    const prevState = { topicClusters, savedStrategies, step };

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTopicClusters(keywordAnalysis);
      
      const newSavedStrategy: SavedKeywordStrategyResult = {
        id: Date.now(),
        goal,
        audience,
        seedKeywords,
        timestamp: new Date().toISOString(),
        strategy: {
          keywordAnalysis,
          topicClusters: result,
        },
      };
      const updatedSavedStrategies = [newSavedStrategy, ...savedStrategies];
      
      const redoAction = () => {
        setTopicClusters(result);
        setStep(3);
        setSavedStrategies(updatedSavedStrategies);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSavedStrategies));
      };

      const undoAction = () => {
        setTopicClusters(prevState.topicClusters);
        setStep(prevState.step);
        setSavedStrategies(prevState.savedStrategies);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedStrategies));
      };
      
      redoAction();
      pushAction({ undo: undoAction, redo: redoAction });

    } catch (e) {
      setError('Failed to create topic clusters. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setGoal('Increase Website Traffic');
    setAudience('');
    setSeedKeywords('');
    setKeywordAnalysis(null);
    setTopicClusters(null);
    setError(null);
  };
  
  const handleView = (id: number) => {
    const strategyToView = savedStrategies.find(s => s.id === id);
    if (strategyToView) {
      setGoal(strategyToView.goal);
      setAudience(strategyToView.audience);
      setSeedKeywords(strategyToView.seedKeywords);
      setKeywordAnalysis(strategyToView.strategy.keywordAnalysis);
      setTopicClusters(strategyToView.strategy.topicClusters);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: number) => {
    const prevState = { savedStrategies };
    const updatedStrategies = savedStrategies.filter(s => s.id !== id);
    
    const redoAction = () => {
      setSavedStrategies(updatedStrategies);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStrategies));
    };
    const undoAction = () => {
      setSavedStrategies(prevState.savedStrategies);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState.savedStrategies));
    };

    redoAction();
    pushAction({ undo: undoAction, redo: redoAction });
  };


  const renderKeywords = (title: string, keywords: KeywordWithDescription[]) => (
    <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4" open>
      <summary className="font-semibold text-lg cursor-pointer">{title}</summary>
      <div className="mt-4 space-y-3">
        {keywords && keywords.length > 0 ? keywords.map(item => (
          <div key={item.keyword} className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.keyword}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
          </div>
        )) : <p className="text-gray-500 dark:text-gray-400">No keywords found for this category.</p>}
      </div>
    </details>
  );

  return (
    <div className="space-y-6">
       <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Building a Topic Cluster Strategy</h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-3 prose prose-sm max-w-none dark:prose-invert">
          <p>A modern keyword strategy goes beyond targeting individual keywords. To establish authority and rank for competitive terms, you need to build topic clusters. This involves creating a central "pillar" page that provides a broad overview of a topic, and then surrounding it with multiple "cluster" pages that delve into specific subtopics in greater detail. These pages all link to each other, signaling to Google that you are an expert on the subject.</p>
          <p>This multi-step tool guides you through creating a powerful topic cluster model. You start by defining your goals and audience, then the AI generates keyword ideas categorized by user intent. Finally, it organizes these keywords into logical pillar and cluster groups, giving you a clear content roadmap. If you need more initial ideas, our basic <Link to="/keywordResearch" className="text-brand-primary hover:underline">Keyword Research</Link> tool is a great place to start.</p>
        </div>
      </Card>
      <Card>
        <ProgressBar currentStep={step} totalSteps={3} />
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 1: Define Your Foundation</h2>
            <p className="text-gray-600 dark:text-gray-300">Start by telling us your goal, your audience, and a few starting keywords.</p>
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Goal</label>
              <select id="goal" value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option>Increase Website Traffic</option>
                <option>Generate Leads/Sales</option>
                <option>Build Brand Awareness</option>
              </select>
            </div>
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
              <Textarea id="audience" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., Vegan home bakers, aged 25-40, looking for easy recipes." rows={3} />
            </div>
            <div>
              <label htmlFor="seedKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seed Keywords</label>
              <Input id="seedKeywords" type="text" value={seedKeywords} onChange={e => setSeedKeywords(e.target.value)} placeholder="e.g., vegan baking, plant-based desserts" />
            </div>
            <Button onClick={handleStep1Submit} isLoading={isLoading}>Generate Keyword Ideas</Button>
          </div>
        )}

        {step === 2 && keywordAnalysis && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 2: Keyword Analysis & Intent</h2>
            <p className="text-gray-600 dark:text-gray-300">Here are keywords categorized by search intent. Review them and proceed to create topic clusters.</p>
            {renderKeywords("Informational Keywords", keywordAnalysis.informationalKeywords)}
            {renderKeywords("Commercial Keywords", keywordAnalysis.commercialKeywords)}
            {renderKeywords("Transactional Keywords", keywordAnalysis.transactionalKeywords)}
            <div className="flex gap-2">
                <Button onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleStep2Submit} isLoading={isLoading}>Create Topic Clusters</Button>
            </div>
          </div>
        )}

        {step === 3 && topicClusters && keywordAnalysis && (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 3: Your Topic Cluster Strategy</h2>
                     <ExportDropdown
                        onExportJSON={() => exportAsJSON({ keywordAnalysis, topicClusters }, `keyword-strategy-${seedKeywords}`)}
                        onExportCSV={() => {
                            const csvString = convertKeywordStrategyToCSV({ keywordAnalysis, topicClusters });
                            exportAsCSV(csvString, `keyword-strategy-${seedKeywords}`);
                        }}
                    />
                </div>
                <p className="text-gray-600 dark:text-gray-300">This strategy organizes your keywords into content pillars and clusters to build topical authority.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topicClusters.topicClusters.map(cluster => (
                        <div key={cluster.pillarKeyword} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-brand-primary text-lg">{cluster.pillarKeyword} (Pillar)</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">{cluster.clusterDescription}</p>
                            <ul className="space-y-1">
                                {cluster.clusterKeywords.map(kw => (
                                    <li key={kw} className="text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">{kw}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <Button onClick={handleStartOver}>Start Over</Button>
            </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        )}

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </Card>
      
      {savedStrategies.length > 0 && (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saved Strategies</h2>
            <div className="mt-4 space-y-3">
                {savedStrategies.map(saved => (
                    <div key={saved.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{saved.seedKeywords}</p>
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

export default KeywordStrategist;
