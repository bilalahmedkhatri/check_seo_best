import React from 'react';

export type NavItemKey = 'keywordResearch' | 'serpMonitoring' | 'contentBrief' | 'onPageOptimizer' | 'keywordStrategist' | 'seoAudit';

export interface NavItem {
  key: NavItemKey;
  label: string;
  title: string;
  description: string;
}

// Result types
export interface KeywordWithVolume {
  keyword: string;
  searchVolume: string;
}

export interface Keywords {
  primaryKeywords: KeywordWithVolume[];
  longTailKeywords: KeywordWithVolume[];
  questionBasedKeywords: KeywordWithVolume[];
  lsiKeywords: KeywordWithVolume[];
}

export interface SERPAnalysis {
  competitors: { url: string; title: string; description: string }[];
  analysis: string;
  recommendations: string[];
}

export interface CompetitorKeywordInfo {
  keyword: string;
  rank: string;
  searchVolume: string;
  difficulty: string;
}
export type CompetitorKeywordAnalysisResult = CompetitorKeywordInfo[];


export interface ContentBriefData {
  titleSuggestion: string;
  metaDescriptionSuggestion: string;
  outline: { heading: string; subheadings: string[] }[];
  lsiKeywords: string[];
  suggestedWordCount: string;
  targetAudience: string;
}

export interface OptimizationResult {
  seoScore: number;
  keywordDensity: string;
  readability: string;
  titleAndHeadings: string;
  metaDescription: string;
  linking: string;
}

export interface KeywordWithDescription {
  keyword: string;
  description: string;
}

export interface KeywordStrategyResult {
  informationalKeywords: KeywordWithDescription[];
  commercialKeywords: KeywordWithDescription[];
  transactionalKeywords: KeywordWithDescription[];
}

export interface TopicCluster {
  pillarKeyword: string;
  clusterDescription: string;
  clusterKeywords: string[];
}

export interface TopicClusterResult {
  topicClusters: TopicCluster[];
}

export interface AuditCheck {
  check: string;
  status: 'Pass' | 'Fail' | 'Warning' | 'Info';
  recommendation: string;
}

export interface SEOAuditResult {
  overallScore: number;
  onPageSeo: AuditCheck[];
  contentQuality: AuditCheck[];
  technicalSeo: AuditCheck[];
}

// Saved result types
export interface SavedKeywordResult {
  id: number;
  topic: string;
  timestamp: string;
  result: Keywords;
}

export interface SavedSERPResult {
  id: number;
  keyword: string;
  domain: string;
  timestamp: string;
  result: SERPAnalysis;
}

export interface SavedCompetitorKeywordResult {
  id: number;
  domain: string;
  timestamp: string;
  result: CompetitorKeywordAnalysisResult;
}

export interface SavedContentBriefResult {
  id: number;
  keyword: string;
  timestamp: string;
  result: ContentBriefData;
}

export interface SavedOptimizerResult {
  id: number;
  keyword: string;
  content: string;
  timestamp: string;
  result: OptimizationResult;
}

export interface SavedKeywordStrategyResult {
  id: number;
  goal: string;
  audience: string;
  seedKeywords: string;
  timestamp: string;
  strategy: {
    keywordAnalysis: KeywordStrategyResult;
    topicClusters: TopicClusterResult;
  }
}

export interface SavedSEOAuditResult {
  id: number;
  url: string;
  keyword: string;
  timestamp: string;
  result: SEOAuditResult;
}