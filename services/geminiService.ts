import { GoogleGenAI, Type } from "@google/genai";
import type { KeywordStrategyResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const keywordWithVolumeSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            keyword: { type: Type.STRING },
            searchVolume: {
                type: Type.STRING,
                description: "Estimated monthly search volume, e.g., '1.2K', '500', '10K-50K'"
            }
        },
        required: ['keyword', 'searchVolume']
    }
};

export const generateKeywords = async (topic: string) => {
    // FIX: Refactored to use systemInstruction for persona.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Given the topic "${topic}", generate a comprehensive list of related keywords. For each keyword, provide an estimated monthly search volume. Categorize them into 'Primary Keywords', 'Long-Tail Keywords', 'Question-Based Keywords', and 'LSI Keywords'.`,
        config: {
            systemInstruction: "You are an expert SEO keyword researcher who can estimate search volumes.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    primaryKeywords: keywordWithVolumeSchema,
                    longTailKeywords: keywordWithVolumeSchema,
                    questionBasedKeywords: keywordWithVolumeSchema,
                    lsiKeywords: keywordWithVolumeSchema,
                }
            }
        }
    });

    return JSON.parse(response.text);
};

export const analyzeSERP = async (keyword: string, domain: string) => {
    // FIX: Refactored to use systemInstruction for persona and instructions.
    const systemInstruction = `You are a senior SEO analyst. Using real-time Google Search results, analyze the SERP for a given keyword.
Your entire response MUST be a single, valid JSON object, with no other text, markdown, or explanations before or after it.

The JSON object must have this exact structure:
{
  "competitors": [
    { "url": "string", "title": "string", "description": "string" }
  ],
  "analysis": "string",
  "recommendations": ["string"]
}`;
    
    const prompt = `Perform the analysis for the keyword "${keyword}":
1. Identify the top 5 ranking organic competitors. For each, populate their URL, meta title, and meta description in the "competitors" array.
2. Provide an expert analysis of the user's domain ("${domain}") likely position and challenges based on the top competitors. Put this in the "analysis" field.
3. Provide 5 actionable on-page and off-page SEO recommendations for "${domain}" to improve its ranking against these competitors. Put these in the "recommendations" array.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}],
        }
    });

    // NOTE: Per Gemini SDK guidelines, `response.text` with the googleSearch tool
    // is not guaranteed to be a clean JSON string. Sanitize it before parsing.
    let jsonString = response.text.trim();
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonString = jsonMatch[0];
    }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Failed to parse SERP response as JSON:', response.text, e);
        throw new Error('Failed to parse SERP analysis. Please try again.');
    }
};

export const findCompetitorKeywords = async (domain: string) => {
    const systemInstruction = `You are a senior SEO analyst. Using real-time Google Search results, identify the top-ranking organic keywords for a given domain.
Your entire response MUST be a single, valid JSON array of objects, with no other text, markdown, or explanations before or after it.

The JSON array must have this exact structure:
[
  { "keyword": "string", "rank": "string", "searchVolume": "string", "difficulty": "string" }
]
- rank: Estimated ranking position (e.g., '1', '3-5', '8').
- searchVolume: Estimated monthly search volume (e.g., '1.2K', '500', '1M+').
- difficulty: SEO difficulty to rank for this keyword (e.g., 'Low', 'Medium', 'High', 'Very High').`;

    const prompt = `Analyze the domain "${domain}" and identify its top 10 organic keywords. Provide the data in the requested JSON format.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }],
        }
    });
    
    let jsonString = response.text.trim();
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        jsonString = jsonMatch[0];
    }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Failed to parse competitor keywords response as JSON:', response.text, e);
        throw new Error('Failed to parse competitor keywords. The format may be invalid.');
    }
};


export const createContentBrief = async (keyword: string) => {
    // FIX: Refactored to use systemInstruction for persona.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a detailed content brief for an article targeting the keyword "${keyword}". The brief should include: a catchy title suggestion, a meta description suggestion (under 160 characters), a detailed article outline with H2 and H3 headings, a list of 10-15 LSI keywords to include, a suggested word count, and the target audience.`,
        config: {
            systemInstruction: "You are an expert content strategist.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titleSuggestion: { type: Type.STRING },
                    metaDescriptionSuggestion: { type: Type.STRING },
                    outline: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                heading: { type: Type.STRING },
                                subheadings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            }
                        }
                    },
                    lsiKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedWordCount: { type: Type.STRING },
                    targetAudience: { type: Type.STRING },
                }
            }
        }
    });

    return JSON.parse(response.text);
};

export const optimizeContent = async (keyword: string, content: string) => {
    // FIX: Refactored to use systemInstruction for persona.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following content for the target keyword "${keyword}". Content: """${content}""". Provide an overall SEO score out of 100. Then, give specific, actionable recommendations for improvement in these categories: 'Keyword Density', 'Readability', 'Title & Headings', 'Meta Description', and 'Internal/External Linking'. If the content is good in a category, say so. Keep feedback concise and helpful.`,
        config: {
            systemInstruction: "You are an on-page SEO optimization expert.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    seoScore: { type: Type.NUMBER },
                    keywordDensity: { type: Type.STRING },
                    readability: { type: Type.STRING },
                    titleAndHeadings: { type: Type.STRING },
                    metaDescription: { type: Type.STRING },
                    linking: { type: Type.STRING },
                }
            }
        }
    });
    
    return JSON.parse(response.text);
};

export const generateKeywordStrategy = async (goal: string, audience: string, seedKeywords: string) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Given the primary SEO goal of "${goal}", a target audience described as "${audience}", and starting with the seed keywords "${seedKeywords}", generate a list of relevant keywords. Categorize these keywords by user search intent: Informational, Commercial, and Transactional. For each keyword, provide a brief description of why it fits that category and its relevance to the audience.`,
        config: {
            systemInstruction: "You are an expert SEO and keyword strategist.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    informationalKeywords: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                keyword: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                            required: ['keyword', 'description']
                        }
                    },
                    commercialKeywords: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                keyword: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                            required: ['keyword', 'description']
                        }
                    },
                    transactionalKeywords: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                keyword: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                            required: ['keyword', 'description']
                        }
                    },
                }
            }
        }
    });
    return JSON.parse(response.text);
};

export const generateTopicClusters = async (keywordData: KeywordStrategyResult) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following categorized list of keywords, organize them into logical topic clusters. For each cluster, identify a broad 'pillarKeyword' that can serve as the main topic for a pillar page. Then, list several related 'clusterKeywords' that would be suitable for supporting articles. Also provide a brief 'clusterDescription'. Keywords: ${JSON.stringify(keywordData)}`,
        config: {
            systemInstruction: "You are an expert content strategist specializing in topic authority.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topicClusters: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                pillarKeyword: { type: Type.STRING },
                                clusterDescription: { type: Type.STRING },
                                clusterKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ['pillarKeyword', 'clusterDescription', 'clusterKeywords']
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text);
};

export const auditSEO = async (url: string, keyword: string) => {
    const systemInstruction = `You are a technical SEO expert conducting a website audit. Using Google Search, analyze the provided URL.
Your entire response MUST be a single, valid JSON object with no other text or explanations.

The JSON object must have this exact structure:
{
  "overallScore": number,
  "onPageSeo": [ { "check": "string", "status": "Pass" | "Fail" | "Warning" | "Info", "recommendation": "string" } ],
  "contentQuality": [ { "check": "string", "status": "Pass" | "Fail" | "Warning" | "Info", "recommendation": "string" } ],
  "technicalSeo": [ { "check": "string", "status": "Pass" | "Fail" | "Warning" | "Info", "recommendation": "string" } ]
}

Audit Checklist:
- On-Page SEO: Title Tag (unique, length, keyword), Meta Description (unique, length, CTA), Header Tags (H1 presence, structure), Image SEO (alt text, file names).
- Content Quality: Keyword Strategy (focus keyword usage), Content Originality (check for duplication), Readability (clarity, formatting).
- Technical SEO: Mobile-Friendliness, Page Speed (general assessment), Internal Linking, Robots.txt & Sitemap (check for presence and basic correctness).

Calculate an "overallScore" out of 100 based on the number of "Pass" statuses. Be strict but fair.
For each check, provide a concise "recommendation" with actionable advice.`;

    const prompt = `Audit the website at URL "${url}" with a focus on the keyword "${keyword}". Follow the instructions and provide the full JSON response.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }],
        }
    });

    let jsonString = response.text.trim();
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonString = jsonMatch[0];
    }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Failed to parse SEO Audit response as JSON:', response.text, e);
        throw new Error('Failed to parse SEO audit. The format may be invalid.');
    }
};