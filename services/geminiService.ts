import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, CategorizationRule } from "../types";
import { getCategoriesForMode } from "../constants";
import type { Transaction } from "../types";

// ---------- FIXED getAiClient ----------

const getAiClient = () => {
<<<<<<< HEAD
  // Safely access process.env to avoid ReferenceError in browser
  const getAIClient = () => {
=======
>>>>>>> 138d99dbfed98e20bd86cad40fed1cafed9c019d
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY not found");
    throw new Error("VITE_GEMINI_API_KEY not set");
  }

  return new GoogleGenAI({ apiKey });
};

// ------------------------------------------------------------
// ------------------ CATEGORIZE TRANSACTION ------------------
// ------------------------------------------------------------

export const categorizeTransaction = async (
  description: string,
  mode: AppMode,
  rules: CategorizationRule[] = []
): Promise<{ category: string; explanation: string }> => {
  const ai = getAiClient();
  const categories = getCategoriesForMode(mode);

  const relevantRules = rules.filter((r) =>
    description.toLowerCase().includes(r.keyword.toLowerCase())
  );

  const rulesContext =
    relevantRules.length > 0
      ? `IMPORTANT USER RULES: The user has defined the following strict rules. If the description matches the keyword, you MUST use the specified category.
         ${JSON.stringify(relevantRules)}`
      : "";

  const prompt = `
  You are an expert financial transaction categorizer for Indian users.
  
  Transaction Description: "${description}"
  
  ${rulesContext}

  If no user rule applies, please categorize it into one of the following categories:
  [${categories.join(", ")}]

  Respond ONLY with JSON:
  {"category": "...", "explanation": "..."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["category", "explanation"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const result = JSON.parse(text);

    if (categories.includes(result.category)) return result;

    return {
      category: "Other",
      explanation: "Could not determine a specific category.",
    };
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return { category: "Other", explanation: "AI categorization failed." };
  }
};

// ------------------------------------------------------------
// ------------------ FINANCIAL ADVICE ------------------------
// ------------------------------------------------------------

<<<<<<< HEAD
export const getFinancialAdvice = async (messages: { role: string, parts: { text: string }[] }[], mode: AppMode) => {
    const ai = getAiClient();
    const systemInstruction = mode === AppMode.BUSINESS
        ? 'You are DhanAI, a professional and astute business financial advisor for users in India. Provide concise, data-driven, and actionable financial advice for businesses. Your tone should be formal and analytical.'
        : 'You are DhanAI, a helpful and friendly financial advisor for users in India. Provide concise, clear, and actionable financial advice. Keep your responses brief and easy to understand.';
    
    const responseStream = await ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
      }).sendMessageStream({ message: messages[messages.length-1].parts[0].text });
=======
export const getFinancialAdvice = async (
  messages: { role: string; parts: { text: string }[] }[],
  mode: AppMode
) => {
  const ai = getAiClient();
>>>>>>> 138d99dbfed98e20bd86cad40fed1cafed9c019d

  const systemInstruction =
    mode === AppMode.BUSINESS
      ? "You are DhanAI, a professional business financial advisor..."
      : "You are DhanAI, a friendly personal financial advisor...";

  const responseStream = await ai.chats
    .create({
      model: "gemini-2.5-flash",
      config: { systemInstruction },
    })
    .sendMessageStream({ message: messages[messages.length - 1].parts[0].text });

  return responseStream;
};

// ------------------------------------------------------------
// ----------- ANSWER TRANSACTION QUESTIONS -------------------
// ------------------------------------------------------------

export const answerTransactionQuestion = async (
  question: string,
  transactions: Transaction[],
  mode: AppMode
): Promise<string> => {
  const ai = getAiClient();

  const context = `
    You are an AI analyzing transactions.
    Mode: ${mode}
    Transactions: ${JSON.stringify(transactions, null, 2)}
    Question: "${question}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context,
    });

    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Error answering question", error);
    return "Sorry, I couldn't process that request.";
  }
};

// ------------------------------------------------------------
// ---------------- SME LEDGER SUMMARY ------------------------
// ------------------------------------------------------------

export const getSmeLedgerSummary = async (
  transactions: Transaction[]
): Promise<string> => {
  const ai = getAiClient();

  const context = `
    You are an SME financial analyst.
    Analyze: ${JSON.stringify(transactions, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context,
    });

    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Error generating SME summary:", error);
    return "Accounting summary unavailable.";
  }
};
