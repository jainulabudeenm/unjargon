import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { term } = await req.json();

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      system: 'You are a senior product designer explaining tech jargon to junior designers. Be clear, concise, and use relatable analogies.',
      prompt: `Explain the term: ${term}`,
      schema: z.object({
        analogy: z.string().describe('A "Think of it like..." statement.'),
        description: z.string().describe('A simple 2-sentence explanation.')
      }),
    });

    // Send the correctly formatted JSON back to your frontend
    return Response.json(result.object);
    
  } catch (error) {
    // If it fails, print the REAL reason in your Cursor terminal!
    console.error("AI Backend Error:", error);
    return Response.json({ error: "Failed to generate" }, { status: 500 });
  }
}