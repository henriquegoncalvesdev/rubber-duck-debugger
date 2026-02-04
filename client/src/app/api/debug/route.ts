import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { code, persona } = await req.json();

    const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
    const API_KEY = process.env.SERVICE_API_KEY || '';

    try {
        const backendRes = await fetch(`${SERVER_URL}/debug`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-service-key': API_KEY,
            },
            body: JSON.stringify({ code, persona }),
        });

        if (!backendRes.ok) {
            if (backendRes.status === 429) {
                return NextResponse.json({ error: 'You are chatting too fast! Slow down.' }, { status: 429 });
            }
            return NextResponse.json({ error: backendRes.statusText }, { status: backendRes.status });
        }

        // Proxy the stream
        const stream = backendRes.body;

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
