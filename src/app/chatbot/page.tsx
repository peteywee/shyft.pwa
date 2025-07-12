'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatbotPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/genkit/flows/menuBot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: prompt }),
      });
      const { data } = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse('Error: Could not get a response from the AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Chatbot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the AI a question..."
              className="mb-4"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Thinking...' : 'Ask'}
            </Button>
          </form>
          {response && (
            <div className="mt-4 p-4 border rounded">
              <p>{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
