
import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, CategorizationRule } from "../types";
import { getCategoriesForMode } from "../constants";
import type { Transaction } from '../types';

const getAiClient = () => {
  // Safely access process.env to avoid ReferenceError in browser
  const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY not found");
    throw new Error("VITE_GEMINI_API_KEY not set");
  }

  return new GoogleGenAI({ apiKey });
};

export const categorizeTransaction = async (description: string, mode: AppMode, rules: CategorizationRule[] = []): Promise<{ category: string, explanation: string }> => {
  const ai = getAiClient();
  const categories = getCategoriesForMode(mode);
  
  // Filter rules relevant to this description
  const relevantRules = rules.filter(r => description.toLowerCase().includes(r.keyword.toLowerCase()));
  const rulesContext = relevantRules.length > 0 
    ? `IMPORTANT USER RULES: The user has defined the following strict rules. If the description matches the keyword, you MUST use the specified category.
       ${JSON.stringify(relevantRules)}`
    : '';

  const prompt = `You are an expert financial transaction categorizer for Indian users. Your task is to categorize the transaction and provide a brief explanation.
  
  Transaction Description: "${description}"
  
  ${rulesContext}

  If no user rule applies, please categorize it into one of the following ${mode} finance categories:
  [${categories.join(', ')}]

  Respond ONLY with a valid JSON object in the following format:
  {"category": "...", "explanation": "..."}
  
  The "category" must be one of the provided categories. The "explanation" should be a concise, one-sentence reason for your choice. Always explain why this category was chosen.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'The transaction category.' },
            explanation: { type: Type.STRING, description: 'The reason for the categorization.' },
          },
          required: ['category', 'explanation']
        }
      }
    });

    const text = response.text ? response.text.trim() : '{}';
    const result = JSON.parse(text);

    // Validate if the category is one of the allowed ones or matches a user rule
    if (categories.includes(result.category)) {
      return result;
    } else {
      // Fallback if the model returns an unexpected category
      return { category: 'Other', explanation: 'Could not determine a specific category.' };
    }
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return { category: 'Other', explanation: 'AI categorization failed.' };
  }
};


export const getFinancialAdvice = async (messages: { role: string, parts: { text: string }[] }[], mode: AppMode) => {
    const ai = getAiClient();
    const systemInstruction = mode === AppMode.BUSINESS
        ? 'You are DhanAI, a professional and astute business financial advisor for users in India. Provide concise, data-driven, and actionable financial advice for businesses. Your tone should be formal and analytical.'
        : 'You are DhanAI, a helpful and friendly financial advisor for users in India. Provide concise, clear, and actionable financial advice. Keep your responses brief and easy to understand.';
    
    const responseStream = await ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
      }).sendMessageStream({ message: messages[messages.length-1].parts[0].text });

    return responseStream;
};

export const answerTransactionQuestion = async (question: string, transactions: Transaction[], mode: AppMode): Promise<string> => {
    const ai = getAiClient();
    const businessSpecificPrompts = `
    If the question is about identifying the "best" or "top" client, you MUST analyze the 'Revenue' category transactions. Sum up the total credit amounts from each client (identified by their name in the description, e.g., 'Client Payment #INV003 - TechCorp'). The best client is the one with the highest total revenue. State the client's name and the total amount received from them.

    If the question is about the "worst" or "lowest" client, perform a similar analysis but identify the client with the lowest total revenue.

    For all other business-related questions, answer based on the provided data with a professional and analytical tone.
    `;
    
    const personalPrompts = `Answer based ONLY on the transaction data provided above with a friendly and helpful tone.`;

    const context = `
    You are an AI assistant analyzing a user's financial transactions.
    The user is currently in "${mode}" mode.
    
    Here is a list of financial transactions:
    ${JSON.stringify(transactions, null, 2)}
    
    ${mode === AppMode.BUSINESS ? businessSpecificPrompts : personalPrompts}

    If the answer cannot be found in the data, state that clearly.
    Question: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: context,
        });
        return response.text || "I couldn't generate an answer.";
    } catch (error) {
        console.error("Error answering transaction question:", error);
        return "Sorry, I couldn't process that request.";
    }
};

export const getSmeLedgerSummary = async (transactions: Transaction[]): Promise<string> => {
    const ai = getAiClient();
    const context = `
    You are an expert accountant and financial analyst for Small and Medium Enterprises (SMEs) in India.
    
    Analyze the following business transactions:
    ${JSON.stringify(transactions, null, 2)}
    
    Provide a concise "SME Ledger Summary" that includes:
    1. Total Profit (Revenue - Expenses).
    2. Top Expense Category.
    3. One brief strategic tip to improve cash flow.
    
    Format the output as a short Markdown text suitable for a mobile dashboard card. Do not include greetings.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: context,
        });
        return response.text || "Summary unavailable.";
    } catch (error) {
        console.error("Error generating SME summary:", error);
        return "Accounting summary unavailable.";
    }
};
