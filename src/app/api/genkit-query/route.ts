
import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for the actual Firebase Function URL.
// In a real deployment, you would get this from your Firebase project,
// or use the emulator URL during local development.
const GENKIT_FUNCTION_URL = process.env.NEXT_PUBLIC_GENKIT_FUNCTION_URL || 'http://localhost:5003/<YOUR_FIREBASE_PROJECT_ID>/us-central1/genkit';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call the Genkit Firebase Function
    const response = await fetch(GENKIT_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flow: 'shiftQueryFlow', // The name of your Genkit flow
        input: query,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error calling Genkit function:', errorData);
      return NextResponse.json({ error: 'Failed to get response from Genkit', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
