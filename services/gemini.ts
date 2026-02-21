import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { MediaData } from '../types';

const LOCAL_STORAGE_KEY = 'vmax_gemini_api_key';

// Initialize with environment variable if available, otherwise check localStorage
let apiKey = process.env.API_KEY || '';

if (!apiKey && typeof localStorage !== 'undefined') {
  apiKey = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
}

let aiClient: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, key);
  }
  // Reset client and session to ensure new key is used
  aiClient = null;
  chatSession = null;
};

export const hasApiKey = () => {
  return !!apiKey && apiKey.length > 0;
};

const initializeClient = () => {
  if (!aiClient && apiKey) {
    // Ensure API key is clean (no whitespace, no non-ASCII if possible)
    // The error "String contains non ISO-8859-1 code point" in headers usually comes from the API key.
    // We trim the key and remove any non-ASCII characters to be safe.
    const cleanKey = apiKey.trim().replace(/[^\x00-\x7F]/g, "");
    if (cleanKey) {
        aiClient = new GoogleGenAI({ apiKey: cleanKey });
    }
  }
  return aiClient;
};

const getChatSession = (): Chat => {
  const client = initializeClient();
  if (!client) {
    throw new Error("尚未設定 API Key。請重新整理網頁並輸入您的 Gemini API Key。");
  }
  
  if (!chatSession) {
    chatSession = client.chats.create({
      // Updated to gemini-3-flash-preview as per latest guidelines and to avoid quota issues with experimental models
      model: 'gemini-3-flash-preview', 
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7, 
        topK: 40,
        topP: 0.95,
      },
    });
  }
  return chatSession;
};

export const resetSession = () => {
  chatSession = null;
};

export const isSessionActive = () => {
  return !!chatSession;
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for retrying with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    let statusCode = 0;
    let errorMessage = '';

    // Attempt to extract status and message from various error structures
    if (error instanceof Error) {
        errorMessage = error.message;
    } 
    
    // Check for GoogleGenAI specific error structure or raw JSON response like {"error": {"code": 429, ...}}
    if (error?.status) {
        statusCode = error.status;
    }
    if (error?.error?.code) {
        statusCode = error.error.code;
    }
    if (error?.error?.message) {
        errorMessage += ' ' + error.error.message;
    }
    if (error?.message) {
        errorMessage += ' ' + error.message;
    }

    const lowerMsg = errorMessage.toLowerCase();
    
    const isRetryable = 
        statusCode === 429 || 
        statusCode === 503 || 
        statusCode === 500 ||
        lowerMsg.includes('429') || 
        lowerMsg.includes('resource_exhausted') || 
        lowerMsg.includes('quota') ||
        lowerMsg.includes('overloaded');

    if (retries > 0 && isRetryable) {
      console.warn(`Gemini API Error (Status: ${statusCode || 'unknown'}). Retrying in ${backoff}ms... (${retries} attempts left)`);
      await delay(backoff);
      return withRetry(fn, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export const sendMessageToGemini = async (text: string, media?: MediaData[] | null): Promise<string> => {
  try {
    const chat = getChatSession();
    
    let messageInput: string | any[] = text;

    // If media is present, construct a multimodal message part
    if (media && media.length > 0) {
      messageInput = [
        ...media.map(m => ({
          inlineData: {
            mimeType: m.mimeType,
            data: m.data
          }
        })),
        { text: text }
      ];
    }

    // Use withRetry to handle transient errors
    const result: GenerateContentResponse = await withRetry(async () => {
        return await chat.sendMessage({
            message: messageInput
        });
    });
    
    if (result.text) {
      return result.text;
    } else {
      throw new Error("Empty response from Gemini.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};