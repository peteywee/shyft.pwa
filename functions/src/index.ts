
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Import Genkit and related modules
import { dev, firebase, setup } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-ai';
import { defineFlow, generate } from '@genkit-ai/flow';
import * as z from 'zod'; // Import zod for schema definition

// Assuming genkit-sample.ts contains some flow definition
// For now, let's define a simple one directly here for demonstration
// and then we can refactor it into genkit-sample.ts later if it grows.

setGlobalOptions({ maxInstances: 10 });

// Initialize Genkit
setup({
  defaultApp: 'default-app',
  plugins: [
    googleAI(),
    firebase(), // Initialize Firebase plugin for Genkit
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const shiftQueryFlow = defineFlow({
  name: 'shiftQueryFlow',
  inputSchema: z.string().describe('Natural language query about shifts'),
  outputSchema: z.string().describe('Generated response based on shift query'),
}, async (query) => {
  logger.info(`Received shift query: "${query}"`);

  // This is a placeholder. In a real scenario, you'd use the LLM to
  // parse the query, extract parameters (e.g., date, staff name),
  // and then query Firestore.
  const llmResponse = await generate({
    model: 'gemini-pro', // Using a suitable model
    prompt: `You are an assistant for a staff scheduling application. A user is asking a question about shifts. Based on the following query, provide a concise and helpful answer, or identify what information is being requested. If it's a simple greeting, respond appropriately.

    User query: "${query}"

    Example responses:
    - "Searching for shifts on [Date] for [Staff Name]."
    - "Please specify a date or staff member."
    - "Hello! How can I help you with shifts today?"
    - "Here are the shifts for Dev Staff next week: [list details]"
    `,
  });

  const responseText = llmResponse.text();
  logger.info(`LLM response: ${responseText}`);
  return responseText;
});

// Export the Genkit flow as an HTTP Firebase Function
export const genkit = onRequest(
  {
    maxInstances: 5, // Adjust as needed
    // You might want to secure this endpoint more robustly in production
  },
  dev.createFirebaseHttpHandler()
);
