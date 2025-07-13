
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase-admin';
import { format, addDays, startOfWeek } from 'date-fns';

configureGenkit({
  plugins: [
    firebase(),
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  logSinks: ['firebase'],
  enableTracingAndMetrics: true,
});

const getShiftsForDateRange = async (startDate: Date, endDate: Date): Promise<string> => {
    const shiftsRef = collection(db, 'shifts');
    const q = query(shiftsRef, where('date', '>=', format(startDate, 'yyyy-MM-dd')), where('date', '<=', format(endDate, 'yyyy-MM-dd')));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return `No shifts found between ${format(startDate, 'PPP')} and ${format(endDate, 'PPP')}.`;
    }

    const shifts = querySnapshot.docs.map(doc => doc.data());
    return JSON.stringify(shifts, null, 2);
}

export const menuSuggestionFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.string(),
  },
  async ({ query }) => {
    const prompt = `
        You are an expert shift scheduling assistant for a company named Shyft.
        Your task is to answer user questions based ONLY on the provided shift data.
        The current date is ${format(new Date(), 'yyyy-MM-dd')}.

        Here is the user's question: "${query}"

        Analyze the user's question to determine the date range they are asking about.
        - If they ask about "tomorrow", it's for ${format(addDays(new Date(), 1), 'yyyy-MM-dd')}.
        - If they ask about "next week", it's for the upcoming week starting from the next Monday.
        - If they ask about a specific day like "Monday", assume they mean the upcoming Monday.
        
        Based on the question, determine the start and end dates for the shift data lookup.

        Here is the shift data for the relevant period:
        ${await getShiftsForDateRange(startOfWeek(new Date(), { weekStartsOn: 1 }), addDays(new Date(), 7))}

        Now, answer the user's question in a clear, concise, and friendly manner.
        If you cannot answer the question from the data, say "I'm sorry, I don't have enough information to answer that."
    `;
    
    const llmResponse = await run('generate', async () => ({
        prompt,
        model: 'gemini-1.5-flash',
        config: { temperature: 0.1 },
    }));
    
    return llmResponse.output() as string;
  }
);
