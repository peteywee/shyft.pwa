import { flow } from 'genkit';
import { ai } from './genkit';
import * as z from 'zod';

export const menuBot = flow(
  {
    name: 'menuBot',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      prompt: `You are a friendly chatbot for a restaurant. 
               The user is asking a question about the menu.
               The user's prompt is: ${prompt}`,
      model: 'googleai/gemini-pro',
      config: {
        temperature: 0.5,
      },
    });

    return llmResponse.text();
  }
);
