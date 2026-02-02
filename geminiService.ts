
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Roadmap, TopicDetail, QuizQuestion, NewsItem } from "../types";
import { supabaseService } from "./supabaseService";

const MODELS = {
  PRO: 'gemini-3-pro-preview', 
  FLASH: 'gemini-3-flash-preview',
  TTS: 'gemini-2.5-flash-preview-tts',
  GROQ_DEFAULT: 'llama-3.3-70b-versatile'
};

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Unified LLM Caller with Fallback
const callUnifiedLLM = async (prompt: string, jsonMode: boolean = false, schema?: any) => {
  const GROQ_API_KEY = (process.env as any).GROQ_API_KEY;

  if (GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODELS.GROQ_DEFAULT,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("Groq failed");
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      console.warn("[Turbo Engine] Groq unavailable, falling back to Gemini...");
    }
  }

  // Gemini Fallback
  const ai = getAIClient();
  const geminiResponse = await ai.models.generateContent({
    model: jsonMode ? MODELS.PRO : MODELS.FLASH,
    contents: prompt,
    config: jsonMode ? {
      responseMimeType: "application/json",
      responseSchema: schema
    } : undefined
  });

  return geminiResponse.text;
};

// In-Memory Caches
const topicCache: Record<string, TopicDetail> = {};
const quizCache: Record<string, QuizQuestion[]> = {};
const NEWS_CACHE_KEY = 'omnimaster_news_cache';

export const generateRoadmap = async (subject: string, language: string = "English"): Promise<Roadmap> => {
  const cachedRoadmap = await supabaseService.findGlobalRoadmap(subject);
  if (cachedRoadmap) return cachedRoadmap;

  const prompt = `Architect a 6-module learning roadmap for "${subject}" in ${language}. Provide a module description and 4 sub-topics each. Return valid JSON.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      goal: { type: Type.STRING },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "description", "topics"]
        }
      }
    },
    required: ["subject", "goal", "steps"]
  };

  const raw = await callUnifiedLLM(prompt, true, schema);
  return JSON.parse(raw || "{}");
};

export const generateTopicExplanation = async (topic: string, subject: string, language: string = "English"): Promise<TopicDetail> => {
  const cacheKey = `${subject}-${topic}-${language}`;
  if (topicCache[cacheKey]) return topicCache[cacheKey];

  const prompt = `Explain "${topic}" within the context of "${subject}" in ${language}. Use rich Markdown. Include 3 core points and 2 practical examples. Return JSON with fields: title, content, keyPoints (array), examples (array).`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      examples: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "content", "keyPoints", "examples"]
  };

  const raw = await callUnifiedLLM(prompt, true, schema);
  const result = JSON.parse(raw || "{}");
  topicCache[cacheKey] = result;
  return result;
};

export const generateQuiz = async (topic: string, subject: string, language: string = "English"): Promise<QuizQuestion[]> => {
  const cacheKey = `${subject}-${topic}-${language}`;
  if (quizCache[cacheKey]) return quizCache[cacheKey];

  const prompt = `Create 5 challenging multiple-choice questions for "${topic}" in ${language}. Include clear explanations. Return JSON array of objects with fields: question, options (4 strings), correctAnswerIndex (0-3), explanation.`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correctAnswerIndex", "explanation"]
    }
  };

  const raw = await callUnifiedLLM(prompt, true, schema);
  const result = JSON.parse(raw || "[]");
  quizCache[cacheKey] = result;
  return result;
};

export const fetchDailyNews = async (category: string = "Discovery", language: string = "English"): Promise<NewsItem[]> => {
  const stored = localStorage.getItem(NEWS_CACHE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const lastFetch = new Date(parsed.timestamp);
      const today = new Date();
      if (lastFetch.toDateString() === today.toDateString() && parsed.category === category && parsed.language === language) {
        return parsed.news;
      }
    } catch (e) {
      localStorage.removeItem(NEWS_CACHE_KEY);
    }
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Global latest news in ${category} for ${language}. 5 stories. Return ONLY JSON.`,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const json = JSON.parse(response.text || "[]");
    
    const news: NewsItem[] = json.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `news-${idx}-${Date.now()}`,
      timestamp: Date.now(),
      url: grounding?.[idx]?.web?.uri || item.url || "#"
    }));

    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      category,
      language,
      news
    }));

    return news;
  } catch (err) {
    return []; 
  }
};

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch { return ""; }
};

export const getChatResponse = async (persona: string, name: string, lang: string, ctx: string, msg: string): Promise<string> => {
  const prompt = `Persona: ${persona}. Name: ${name}. Context: ${ctx}. Message: ${msg}. Lang: ${lang}. Response in 1 sentence.`;
  const response = await callUnifiedLLM(prompt);
  return response || "I'm with you.";
};
