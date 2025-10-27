import type { Keywords, SERPAnalysis, ContentBriefData, OptimizationResult, KeywordStrategyResult, TopicClusterResult, CompetitorKeywordAnalysisResult, SEOAuditResult } from '../types';

const sanitizeFileName = (name: string) => {
  // Replace spaces and special chars with underscores, keep it reasonably short
  return name.replace(/[\s\W]+/g, '_').substring(0, 50);
};

export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAsJSON = (data: object, baseFileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const sanitizedFileName = sanitizeFileName(baseFileName);
  downloadFile(jsonString, `${sanitizedFileName}.json`, 'application/json');
};

export const exportAsCSV = (csvString: string, baseFileName: string) => {
    const sanitizedFileName = sanitizeFileName(baseFileName);
    downloadFile(csvString, `${sanitizedFileName}.csv`, 'text/csv;charset=utf-8;');
};

// CSV Conversion Utilities

const toCsvRow = (row: (string | number | undefined)[]) => {
    return row.map(cell => {
        const strCell = (cell === null || cell === undefined) ? '' : String(cell);
        // Escape quotes by doubling them
        const escapedCell = strCell.replace(/"/g, '""');
        // Quote the cell if it contains a comma, quote, or newline
        if (/[",\n]/.test(escapedCell)) {
            return `"${escapedCell}"`;
        }
        return escapedCell;
    }).join(',');
};


export const convertKeywordsToCSV = (data: Keywords): string => {
  const rows: (string | number | undefined)[][] = [];
  rows.push(['type', 'keyword', 'searchVolume']);
  data.primaryKeywords?.forEach(kw => rows.push(['Primary Keyword', kw.keyword, kw.searchVolume]));
  data.longTailKeywords?.forEach(kw => rows.push(['Long-Tail Keyword', kw.keyword, kw.searchVolume]));
  data.questionBasedKeywords?.forEach(kw => rows.push(['Question-Based Keyword', kw.keyword, kw.searchVolume]));
  data.lsiKeywords?.forEach(kw => rows.push(['LSI Keyword', kw.keyword, kw.searchVolume]));
  return rows.map(toCsvRow).join('\n');
};

export const convertSERPToCSV = (data: SERPAnalysis): string => {
  const rows: (string | number | undefined)[][] = [];
  rows.push(['type', 'value1', 'value2', 'value3']);

  data.competitors?.forEach(c => rows.push(['competitor', c.url, c.title, c.description]));
  rows.push([]);
  rows.push(['analysis', data.analysis]);
  rows.push([]);
  data.recommendations?.forEach(r => rows.push(['recommendation', r]));

  return rows.map(toCsvRow).join('\n');
};

export const convertCompetitorKeywordsToCSV = (data: CompetitorKeywordAnalysisResult): string => {
  const rows: (string | number | undefined)[][] = [];
  rows.push(['Keyword', 'Rank', 'Search Volume', 'Difficulty']);
  data.forEach(item => {
    rows.push([item.keyword, item.rank, item.searchVolume, item.difficulty]);
  });
  return rows.map(toCsvRow).join('\n');
};

export const convertContentBriefToCSV = (data: ContentBriefData): string => {
  const rows: (string | number | undefined)[][] = [];
  rows.push(['type', 'value1', 'value2']);
  rows.push(['title_suggestion', data.titleSuggestion]);
  rows.push(['meta_description_suggestion', data.metaDescriptionSuggestion]);
  rows.push(['target_audience', data.targetAudience]);
  rows.push(['suggested_word_count', data.suggestedWordCount]);
  
  rows.push([]);
  data.lsiKeywords?.forEach(kw => rows.push(['lsi_keyword', kw]));
  
  rows.push([]);
  data.outline?.forEach(section => {
    rows.push(['outline_h2', section.heading]);
    section.subheadings?.forEach(sub => rows.push(['outline_h3', sub]));
  });
  
  return rows.map(toCsvRow).join('\n');
};

export const convertOptimizerResultToCSV = (data: OptimizationResult): string => {
  const rows: (string | number | undefined)[][] = [];
  rows.push(['metric', 'value']);
  rows.push(['seoScore', data.seoScore]);
  rows.push(['keywordDensity', data.keywordDensity]);
  rows.push(['readability', data.readability]);
  rows.push(['titleAndHeadings', data.titleAndHeadings]);
  rows.push(['metaDescription', data.metaDescription]);
  rows.push(['linking', data.linking]);
  
  return rows.map(toCsvRow).join('\n');
};

export const convertKeywordStrategyToCSV = (data: { keywordAnalysis: KeywordStrategyResult; topicClusters: TopicClusterResult }): string => {
  const rows: (string | number | undefined)[][] = [];

  // Keyword Analysis part
  rows.push(['Part', 'Type/Pillar', 'Keyword/Description', 'Details']);
  rows.push(['Keyword Analysis by Intent']);
  data.keywordAnalysis.informationalKeywords?.forEach(kw => rows.push(['', 'Informational', kw.keyword, kw.description]));
  data.keywordAnalysis.commercialKeywords?.forEach(kw => rows.push(['', 'Commercial', kw.keyword, kw.description]));
  data.keywordAnalysis.transactionalKeywords?.forEach(kw => rows.push(['', 'Transactional', kw.keyword, kw.description]));

  rows.push([]); // Separator

  // Topic Clusters part
  rows.push(['Topic Cluster Strategy']);
  data.topicClusters.topicClusters?.forEach(cluster => {
    rows.push(['', cluster.pillarKeyword, cluster.clusterDescription, '--- CLUSTER KEYWORDS ---']);
    cluster.clusterKeywords.forEach(kw => {
      rows.push(['', '', '', kw]);
    });
  });

  return rows.map(toCsvRow).join('\n');
};

export const convertSEOAuditToCSV = (data: SEOAuditResult): string => {
  const rows: (string | number | undefined)[][] = [];
  rows.push(['Category', 'Check', 'Status', 'Recommendation']);
  
  rows.push(['Overall Score', data.overallScore]);
  rows.push([]);

  rows.push(['On-Page SEO']);
  data.onPageSeo?.forEach(item => rows.push(['', item.check, item.status, item.recommendation]));
  rows.push([]);
  
  rows.push(['Content Quality']);
  data.contentQuality?.forEach(item => rows.push(['', item.check, item.status, item.recommendation]));
  rows.push([]);

  rows.push(['Technical SEO']);
  data.technicalSeo?.forEach(item => rows.push(['', item.check, item.status, item.recommendation]));

  return rows.map(toCsvRow).join('\n');
};