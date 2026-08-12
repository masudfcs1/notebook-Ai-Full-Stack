/**
 * Gemini AI Helper Export Module
 * @file gemini.ts
 * Re-exports the GoogleGenAI instance and Gemini service helper functions for all UI components.
 * 
 * Usage example in any component:
 * ```ts
 * import { ai, geminiService } from "@/lib/gemini";
 * 
 * // Using GoogleGenAI directly as requested by user snippet:
 * const interaction = await (ai as any).interactions?.create?.({
 *   model: "gemini-3.6-flash",
 *   input: "Explain how AI works in a few words",
 * });
 * 
 * // Or using high-level helper:
 * const answer = await geminiService.askAiAssistant("How to summarize meeting notes?");
 * ```
 */

import { ai, geminiService, GEMINI_API_KEY } from "@/services/geminiService";

export { ai, geminiService, GEMINI_API_KEY };

export const askGemini = async (prompt: string, model: string = "gemini-2.5-flash") => {
  return await geminiService.generateText(prompt, { model });
};
