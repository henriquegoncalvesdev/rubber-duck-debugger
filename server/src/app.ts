import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { analyzeCode } from './services/llm.service';

import rateLimit from 'express-rate-limit';

const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Main Route
app.post('/debug', async (req, res) => {
    const schema = z.object({
        code: z.string(),
        persona: z.enum(['senior', 'academic', 'duck']).optional(),
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const { code, persona } = parsed.data;

    // Streaming Response
    try {
        const stream = await analyzeCode(code, persona || 'senior');

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(content);
            }
        }
        res.end();
    } catch (error: any) {
        console.error('Streaming error:', error);
        if (error.message && error.message.includes('OPENAI_API_KEY')) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }
        return res.status(500).json({ error: 'Failed to analyze code' });
    }
});

app.post('/generate-docs', async (req, res) => {
    const schema = z.object({ code: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { code } = parsed.data;

    try {
        const stream = await analyzeCode(code, 'doc_writer');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) res.write(content);
        }
        res.end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate docs' });
    }
});

export default app;
