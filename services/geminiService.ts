
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Simulated OCR using Gemini
   */
  async performOCR(imageDataBase64: string, mimeType: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: imageDataBase64, mimeType } },
            { text: "Perform high-accuracy OCR on this image. Return only the extracted text. If there is no text, say 'No text detected'." }
          ]
        }
      });
      // Correctly access .text property from GenerateContentResponse
      return response.text || "No text extracted.";
    } catch (error) {
      console.error("OCR Error:", error);
      throw error;
    }
  },

  /**
   * Summarize a text document
   */
  async summarizeDocument(text: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following text briefly and professionally:\n\n${text}`,
      });
      // Correctly access .text property from GenerateContentResponse
      return response.text || "Summary unavailable.";
    } catch (error) {
      console.error("Summary Error:", error);
      throw error;
    }
  },

  /**
   * Simulate "Website to PDF" by scraping text content
   */
  async fetchWebsiteContent(url: string): Promise<{ title: string; content: string }> {
    try {
      // Note: Direct URL fetching from client-side GenAI is not a "browser" tool, 
      // but we can ask Gemini to "imagine" a summary if we give it the URL or use a proxy.
      // For this demo, we use a prompt to simulate knowledge.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a web scraper. Provide a detailed markdown-formatted text version of the website at ${url}. Include main headers and core content.`,
      });
      
      return {
        title: `Export from ${url}`,
        // Correctly access .text property from GenerateContentResponse
        content: response.text || "Content could not be fetched."
      };
    } catch (error) {
      console.error("Web Fetch Error:", error);
      throw error;
    }
  }
};
