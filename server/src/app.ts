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
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(limiter);

// Main Route
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers['x-service-key'];
    const validKey = process.env.SERVICE_API_KEY;

    // Skip auth if no key is configured (local dev mode without security)
    if (!validKey) return next();

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Service Key' });
    }
    next();
};

app.post('/debug', authenticate, async (req, res) => {
    const schema = z.object({
        code: z.string().max(5000, "Code snippet is too long (max 5000 chars)"), // Cost Protection
        persona: z.enum(['senior', 'academic', 'duck', 'doc_writer']).optional(),
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
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
        if (res.headersSent) {
            res.write(`\n\n[Error: ${error.message || 'Connection lost'}]`);
            return res.end();
        }
        if (error.message && error.message.includes('OPENAI_API_KEY')) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }
        return res.status(500).json({ error: error.message || 'Failed to analyze code' });
    }
});

app.post('/generate-docs', async (req, res) => {
    const schema = z.object({
        code: z.string().max(5000, "Code snippet is too long (max 5000 chars)")
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
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
    } catch (error: any) {
        console.error('Streaming error:', error);
        if (res.headersSent) {
            res.write(`\n\n[Error: ${error.message || 'Connection lost'}]`);
            return res.end();
        }
        res.status(500).json({ error: 'Failed to generate docs' });
    }
});

export default app;
