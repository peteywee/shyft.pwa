
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/flow';
import { menuSuggestionFlow } from '@/lib/genkit-flow';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const result = await run(menuSuggestionFlow, { query });

    return NextResponse.json({ text: result });
    
  } catch (error) {
    console.error('API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
