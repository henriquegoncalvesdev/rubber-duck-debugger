import OpenAI from 'openai';
import { SYSTEM_PROMPTS, Persona } from '../prompts';
import dotenv from 'dotenv';

dotenv.config();

const openRouterKey = process.env.OPENROUTER_API_KEY;
const openAiKey = process.env.OPENAI_API_KEY; // Fallback

const apiKey = openRouterKey || openAiKey;

// Default to OpenRouter URL if using OpenRouter key, otherwise default to OpenAI, or use explicit override
const defaultBaseURL = openRouterKey ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1';
const baseURL = process.env.OPENAI_BASE_URL || defaultBaseURL;

const modelName = process.env.OPENAI_MODEL_NAME || (openRouterKey ? 'openai/gpt-4o-mini' : 'gpt-4o');

// Fail gracefully if no key is present
const openai = apiKey ? new OpenAI({ apiKey, baseURL }) : null;

export async function analyzeCode(code: string, persona: Persona) {
    if (!openai) {
        console.error('Missing API Key. Checked OPENROUTER_API_KEY and OPENAI_API_KEY.');
        throw new Error('API Key is not set in the server environment.');
    }

    const systemPrompt = SYSTEM_PROMPTS[persona];

    console.log(`Analyzing code with model: ${modelName} via ${baseURL}`);

    try {
        const stream = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Here is my code:\n\n${code}` },
            ],
            stream: true,
            max_tokens: 1000, // Cost Protection
        });

        return stream;
    } catch (error: any) {
        console.error('LLM Service Error:', error);
        // Throw the actual error message so the controller can log it/send it
        throw new Error(error.message || 'Failed to communicate with AI provider');
    }
}
