// Import the Genkit core libraries and plugins.
import { genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";

// CORRECTED IMPORTS: onCallGenkit is from @genkit-ai/firebase
// hasClaim is a v2 helper, typically from the 'identity' submodule.
import { onCallGenkit } from "@genkit-ai/firebase";
import { hasClaim } from "firebase-functions/v2/identity";

// Genkit models generally depend on an API key.
import { defineSecret } from "firebase-functions/params";

// The Firebase telemetry plugin for observability.
import { enableFirebaseTelemetry } from "@genkit-ai/firebase";

// Initialize Firebase Telemetry
enableFirebaseTelemetry();

// If you are using Google generative AI you can get an API key at https://aistudio.google.com/app/apikey
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

const ai = genkit({
  plugins: [
    // Load the Google AI plugin. It will use the GOOGLE_GENAI_API_KEY secret.
    googleAI(),
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
export const menuSuggestionFlow = ai.defineFlow({
    name: "menuSuggestionFlow",
    inputSchema: z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
  }, async (subject, { sendChunk }) => {
    // Construct a request and send it to the model API.
    const prompt =
      `Suggest an item for the menu of a ${subject} themed restaurant`;
    const { response, stream } = ai.generateStream({
      model: gemini20Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text());
    }

    // Handle the response from the model API.
    return (await response).text();
  }
);

// Export the Genkit flow as an HttpsCallable function.
export const menuSuggestion = onCallGenkit(
  {
    // Uncomment to enable AppCheck.
    // enforceAppCheck: true,

    // Example auth policy: require the user to be signed in.
    // authPolicy: (auth, input) => {
    //   if (!auth) {
    //     throw new Error("User must be signed in.");
    //   }
    // },
  },
  menuSuggestionFlow // Pass the flow to be exported
);
