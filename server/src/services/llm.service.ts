import OpenAI from 'openai';
import { SYSTEM_PROMPTS, Persona } from '../prompts';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

// Fail gracefully if no key is present (for development safety)
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function analyzeCode(code: string, persona: Persona) {
    if (!openai) {
        throw new Error('OPENAI_API_KEY is not set in the server environment metrics.');
    }

    const systemPrompt = SYSTEM_PROMPTS[persona];

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o', // or gpt-3.5-turbo if cost is a concern
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Here is my code:\n\n${code}` },
            ],
            stream: true,
        });

        return stream;
    } catch (error: any) {
        console.error('OpenAI API Error:', error);
        throw new Error(error.message || 'Failed to communicate with AI');
    }
}
