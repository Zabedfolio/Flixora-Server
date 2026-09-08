import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export const processAIChatMessage = async (
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
): Promise<string> => {
  try {
    const systemInstruction = `
You are Flixora AI, the helpful and friendly streaming assistant for "Flixora", a premier movie and TV show streaming platform.
Your responsibilities:
1. Recommend movies, TV shows, and anime based on user preferences, genres, release years, or moods.
2. Help users navigate the platform (e.g., finding trending movies, managing watchlists, subscription plans).
3. Provide concise, clear, and engaging responses with formatting (bullet points or numbered lists where appropriate).
4. Keep responses friendly and focused on movies, entertainment, and streaming guidance.
`;

    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    return (
      response.text ||
      "I'm having trouble processing that right now. How else can I help you find movies on Flixora?"
    );
  } catch (error) {
    console.error('Error in processAIChatMessage:', error);
    throw new Error('Failed to get response from Flixora AI');
  }
};
