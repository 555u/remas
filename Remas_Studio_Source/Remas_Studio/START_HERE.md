# Run Remas’s Studio on Windows

1. Install Node.js 22 or newer.
2. Extract the ZIP, then open PowerShell in the extracted Remas_Studio folder.
3. To use Ask Rashed, create your local settings file.

```powershell
Copy-Item .env.example .env
notepad .env
```

In .env, paste your Groq key after `GROQ_API_KEY=` and save. The file stays on your computer and is ignored by Git.

4. Start the studio.

```powershell
node --env-file=.env scripts/dev.mjs
```

5. Open http://localhost:3000. To explore without an AI key, run `npm run dev` instead.

No dependencies need to be installed. Run `npm test` to check the quizzes and chat endpoint. The production build command is `npm run build`.
