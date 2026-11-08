# Remas’s Studio

A phone-width painting studio with eight moonlit studies, a scored medium quiz, watercolor wash lesson, painting exercises, palettes, and a device-local notebook.

Run `npm run dev` to preview and `npm test` to check scoring and the chat endpoint. There are no project dependencies. `npm run build` packages a Worker ES module at `dist/server/index.js`.

## Ask Rashed

In the production runtime settings, add a secret named `GROQ_API_KEY`, then deploy again. The Worker calls Groq from `/api/chat` and defaults to `qwen/qwen3.8-27b`. The optional `GROQ_MODEL` variable selects a different Groq chat model. When only `GEMINI_API_KEY` is set, the Worker uses Gemini. For local testing, provide these variables in the server process environment.

Chat sends the last few messages and, if the visitor chooses to share them, the style and medium results to the configured AI provider. Notes, palettes, and saved paintings stay in browser storage. Chat history stays in memory for the current visit. The unavailable state offers labeled studio tips.
