import React from 'react';
import type { NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'keywordResearch',
    label: 'Keyword Research',
    title: 'Keyword Research',
    description: 'Uncover valuable long-tail, LSI, and question-based keywords. Our AI provides actionable ideas with estimated search volumes to supercharge your content strategy.'
  },
  {
    key: 'serpMonitoring',
    label: 'SERP',
    title: 'SERP Monitoring',
    description: 'Analyze real-time SERPs for any keyword. Identify top competitors, understand their strategies, and get actionable recommendations to outrank them and secure top spots.'
  },
  {
    key: 'contentBrief',
    label: 'Content',
    title: 'AI Content Briefs',
    description: 'Generate comprehensive, SEO-optimized content briefs in seconds. Our AI outlines the perfect article structure, suggests titles, and provides keywords to create content that ranks.'
  },
  {
    key: 'onPageOptimizer',
    label: 'On-Page',
    title: 'On-Page Optimizer',
    description: 'Analyze your content against SEO best practices. Get an overall score and actionable recommendations for keyword density, readability, metadata, and linking to improve your rankings.'
  },
  {
    key: 'keywordStrategist',
    label: 'Strategy',
    title: 'AI Keyword Strategist',
    description: 'Build powerful topic cluster strategies. Our AI guides you from defining goals to organizing keywords into pillars and clusters, establishing your site as a topical authority.'
  },
  {
    key: 'seoAudit',
    label: 'Audit',
    title: 'AI Website SEO Audit',
    description: 'Conduct a comprehensive health check of your website. Our AI analyzes technical SEO, content quality, and on-page factors to provide a clear, actionable audit report.'
  }
];
