import type { 
    Keywords, SERPAnalysis, CompetitorKeywordAnalysisResult, ContentBriefData, 
    OptimizationResult, KeywordStrategyResult, TopicClusterResult, SEOAuditResult, AuditCheck 
} from '../types';

const MOCK_DELAY = 1000;

const delay = () => new Promise(res => setTimeout(res, MOCK_DELAY));

export const generateKeywords = async (topic: string): Promise<Keywords> => {
    await delay();
    if (!topic || topic.toLowerCase().includes('error')) throw new Error("Mock API Error: Invalid topic.");
    console.log(`[API Client] Faking call to backend: /api/generate-keywords with topic: ${topic}`);
    return {
        primaryKeywords: [{ keyword: `Primary keyword for ${topic}`, searchVolume: '12K' }, { keyword: `${topic} strategies`, searchVolume: '8.5K' }],
        longTailKeywords: [{ keyword: `Best long tail keyword for ${topic} in 2024`, searchVolume: '1.1K' }, { keyword: `how to implement ${topic} for small business`, searchVolume: '750' }],
        questionBasedKeywords: [{ keyword: `What is ${topic}?`, searchVolume: '2.5K' }, { keyword: `How does ${topic} work?`, searchVolume: '1.8K' }],
        lsiKeywords: [{ keyword: `${topic} alternatives`, searchVolume: '900' }, { keyword: `advanced ${topic} techniques`, searchVolume: '450' }],
    };
};

export const analyzeSERP = async (keyword: string, domain: string): Promise<SERPAnalysis> => {
    await delay();
    if (!keyword || !domain) throw new Error("Mock API Error: Keyword and domain are required.");
    console.log(`[API Client] Faking SERP analysis for keyword: ${keyword} and domain: ${domain}`);
    return {
        competitors: [
            { url: 'https://competitor1.com/blog/post', title: `Ultimate Guide to ${keyword}`, description: `A deep dive into everything you need to know about ${keyword}.` },
            { url: 'https://competitor2.com/resource', title: `${keyword}: A Beginner's Guide`, description: `Learn the basics of ${keyword} with our comprehensive guide.` },
            // FIX: Corrected a typo where a backtick was used instead of a single quote to close the URL string.
            { url: 'https://competitor3.com/main', title: `Top 10 ${keyword} Strategies`, description: `Explore the top 10 effective strategies for mastering ${keyword}.` }
        ],
        analysis: `The SERP for "${keyword}" is dominated by long-form guides. Your domain, ${domain}, will need to produce highly comprehensive content to compete. There is an opportunity to target "how-to" queries.`,
        recommendations: [
            'Create a 2500+ word "pillar page" covering all aspects of the topic.',
            'Include a unique case study or original research to stand out.',
            'Build high-authority backlinks from relevant industry sites.',
            'Optimize title and meta description for click-through rate.',
            'Ensure the page is mobile-friendly and loads quickly.'
        ]
    };
};

export const findCompetitorKeywords = async (domain: string): Promise<CompetitorKeywordAnalysisResult> => {
    await delay();
    if (!domain) throw new Error("Mock API Error: Domain is required.");
    console.log(`[API Client] Faking competitor keyword analysis for domain: ${domain}`);
    return [
        { keyword: 'top seo strategies', rank: '1', searchVolume: '22K', difficulty: 'High' },
        { keyword: 'content marketing examples', rank: '3', searchVolume: '15K', difficulty: 'Medium' },
        { keyword: 'how to build backlinks', rank: '5', searchVolume: '18K', difficulty: 'Very High' },
        { keyword: 'local seo checklist', rank: '2', searchVolume: '9K', difficulty: 'Medium' }
    ];
};

export const createContentBrief = async (keyword: string): Promise<ContentBriefData> => {
    await delay();
    if (!keyword) throw new Error("Mock API Error: Keyword is required.");
    console.log(`[API Client] Faking content brief creation for keyword: ${keyword}`);
    return {
        titleSuggestion: `The Ultimate Guide to Mastering ${keyword}`,
        metaDescriptionSuggestion: `Unlock the secrets to ${keyword} with our comprehensive guide. Learn actionable tips and strategies to succeed in 2024.`,
        outline: [
            { heading: 'Introduction: What is [Keyword]?', subheadings: ['Why it matters', 'Common misconceptions'] },
            { heading: 'Core Concepts of [Keyword]', subheadings: ['Concept A', 'Concept B', 'Concept C'] },
            { heading: 'Advanced Strategies', subheadings: ['Strategy for experts', 'Tools and resources'] },
            { heading: 'Conclusion', subheadings: ['Key takeaways', 'Future trends'] }
        ],
        lsiKeywords: ['related term 1', 'related term 2', 'synonym for keyword', 'keyword topic ideas'],
        suggestedWordCount: '2000-2500 words',
        targetAudience: 'Intermediate-level professionals in the industry looking to improve their skills.'
    };
};

export const optimizeContent = async (keyword: string, content: string): Promise<OptimizationResult> => {
    await delay();
    if (!keyword || !content) throw new Error("Mock API Error: Keyword and content are required.");
    console.log(`[API Client] Faking content optimization for keyword: ${keyword}`);
    return {
        seoScore: 88,
        keywordDensity: 'Good (1.5%). The keyword appears a healthy number of times.',
        readability: 'Excellent. The content is easy to read and understand.',
        titleAndHeadings: 'Needs Improvement. Consider including the primary keyword in at least one H2 subheading.',
        metaDescription: 'Pass. The meta description is a good length and compelling.',
        linking: 'Good. A healthy mix of internal and external links was found.'
    };
};

export const generateKeywordStrategy = async (goal: string, audience: string, seedKeywords: string): Promise<KeywordStrategyResult> => {
    await delay();
    console.log(`[API Client] Faking keyword strategy generation.`);
    return {
        informationalKeywords: [{ keyword: `How to start with ${seedKeywords}`, description: 'Users are looking for basic information.' }],
        commercialKeywords: [{ keyword: `Best ${seedKeywords} tools`, description: 'Users are comparing options before purchasing.' }],
        transactionalKeywords: [{ keyword: `Buy ${seedKeywords} subscription`, description: 'Users are ready to make a purchase.' }]
    };
};

export const generateTopicClusters = async (keywordData: KeywordStrategyResult): Promise<TopicClusterResult> => {
    await delay();
    console.log(`[API Client] Faking topic cluster generation.`);
    const pillar = keywordData.commercialKeywords[0]?.keyword || 'Pillar Keyword';
    return {
        topicClusters: [
            {
                pillarKeyword: pillar,
                clusterDescription: `A central hub for everything related to ${pillar}.`,
                clusterKeywords: ['Subtopic A', 'Subtopic B', 'Subtopic C']
            }
        ]
    };
};

const createAuditCheck = (check: string, status: AuditCheck['status'], recommendation: string): AuditCheck => ({
    check, status, recommendation
});

export const auditSEO = async (url: string, keyword: string): Promise<SEOAuditResult> => {
    await delay();
    if (!url || !keyword) throw new Error("Mock API Error: URL and keyword are required.");
    console.log(`[API Client] Faking SEO audit for url: ${url}`);
    return {
        overallScore: 78,
        onPageSeo: [
            createAuditCheck('Title Tag', 'Pass', 'Title tag is unique, within length limits, and contains the keyword.'),
            createAuditCheck('Meta Description', 'Warning', 'Meta description is slightly too long. Consider shortening to under 160 characters.'),
            createAuditCheck('Header Tags', 'Pass', 'Proper H1 and H2 structure is in place.'),
            createAuditCheck('Image SEO', 'Fail', 'Missing alt text on several images. Add descriptive alt text to improve accessibility and SEO.')
        ],
        contentQuality: [
            createAuditCheck('Keyword Strategy', 'Pass', 'The focus keyword is well-integrated into the content.'),
            createAuditCheck('Content Originality', 'Pass', 'Content appears to be original.'),
            createAuditCheck('Readability', 'Warning', 'Some paragraphs are long. Break them up for better readability.')
        ],
        technicalSeo: [
            createAuditCheck('Mobile-Friendliness', 'Pass', 'Page is mobile-friendly.'),
            createAuditCheck('Page Speed', 'Info', 'Page speed is acceptable, but could be improved by optimizing images.'),
            createAuditCheck('Internal Linking', 'Pass', 'Good use of internal links to other relevant pages.')
        ]
    };
};
