# 🦆 Rubber Duck Debugger

**"Talk to the duck, fixing the code is just a side effect."**

This is an AI-powered debugging assistant designed to simulate the experience of pair programming with different personas. It demonstrates a modern, decoupled microservice architecture with a focus on security, cost-efficiency, and user experience.

## What is this?
Rubber Duck Debugger is a web application where developers can paste snippets of code and get instant, streaming feedback from an AI.

Unlike generic ChatGPT wrappers, this app uses **specialized personas** to tailor the feedback:
1.  **Seniors Developer**: Blunt, efficient, focuses on performance and best practices.
2.  **Academic Professor**: Explains the *theory* behind the bug (e.g., Big O notation, memory management).
3.  **Rubber Duck**: Uses the Socratic method. It never gives the answer, only asks questions to help *you* find it.
4.  **Technical Writer**: Automatically generates JSDoc/TSDoc documentation for your code.

## Architecture & Tech Stack
This project is built as a **Monorepo** with a strict separation of concerns:

### **Client (Frontend)**
-   **Framework**: Next.js 15 (App Router)
-   **Styling**: TailwindCSS + shadcn/ui
-   **Editor**: Monaco Editor (VS Code's editor engine)
-   **Features**:
    -   Real-time streaming (Server-Sent Events style)
    -   Syntax Highlighting (react-markdown + rehype-highlight)
    -   Responsive Split-View Layout
    -   Dark Mode by default

### **Server (Backend API)**
-   **Runtime**: Node.js + Express
-   **Language**: TypeScript
-   **AI Integration**: OpenAI SDK (compatible with DeepSeek/Llama via OpenRouter)
-   **Security**:
    -   `helmet` used for HTTP header hardening.
    -   `express-rate-limit`: Limits IPs to 5 requests/minute to prevent abuse.
    -   **Strict CORS**: Only allows requests from the Client URL.
    -   **Input Validation**: Zod schemas enforce max character limits (5000 chars) to prevent token exhaustion.

## Security & Cost Optimization
As a portfolio demo, this project implements production-grade safeguards:
-   **No Wallet Drains**: Inputs are capped at 5000 chars, and AI outputs are capped at 1000 tokens.
-   **Rate Limiting**: Prevents DDoS or accidental spamming.
-   **Env Security**: API Keys are checked at startup; the server refuses to run without them.

## ⚡ Getting Started

### 1. Prerequisites
-   Node.js 18+
-   An API Key from [OpenAI](https://platform.openai.com/) or [OpenRouter](https://openrouter.ai/) (Free models available).

### 2. Installation
```bash
# Install dependencies for both client and server
npm install 
```

### 3. Configuration
Create a `.env` file in the `server/` directory:

```env
PORT=3001
# Use OpenRouter for free models (e.g., Gemini 2.0 Flash)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL_NAME=google/gemini-2.0-flash-exp:free
CLIENT_URL=http://localhost:3000
```

### 4. Running the App
You need two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start debugging!
