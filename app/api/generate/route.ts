import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    // 1. We now accept the term AND the list of existing categories from the frontend
    const { term, existingCategories } = await req.json();

    // 2. Format the categories into a neat text list for Gemini to read
    const categoryList = existingCategories
      .map((c: { id: string, title: string }) => `- ID: ${c.id}, Title: ${c.title}`)
      .join('\n');

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      system: 'You are a senior product designer explaining tech jargon to junior designers. Be clear, concise, and use relatable analogies.',
      prompt: `Explain the term: "${term}".\n\nHere are the existing categories in our glossary:\n${categoryList}\n\nDetermine which existing category ID this term best fits into. If it absolutely does not fit into ANY existing category, invent a new kebab-case category ID and a short new category title.`,
      schema: z.object({
        analogy: z.string().describe('A "Think of it like..." statement.'),
        description: z.string().describe('A simple 2-sentence explanation.'),
        categoryId: z.string().describe('The ID of the matching category, or a new kebab-case ID if none fit.'),
        newCategoryTitle: z.string().optional().describe('Only provide this if you created a NEW categoryId. A short, 1-3 word title.')
      }),
    });

    return Response.json(result.object);
    
  } catch (error) {
    console.error("AI Backend Error:", error);
    return Response.json({ error: "Failed to generate" }, { status: 500 });
  }
}