# Open Lovable

Chat with AI to build React apps instantly. Made by the [Firecrawl](https://firecrawl.dev/?ref=open-lovable-github) team.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="Open Lovable Demo" width="100%"/>

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/mendableai/open-lovable.git
cd open-lovable
npm install
```

2. **Add `.env.local`**
```env
# Required
E2B_API_KEY=your_e2b_api_key  # Get from https://e2b.dev (Sandboxes)
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev (Web scraping)

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Get from https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key  # Get from https://platform.openai.com (GPT-5)
GEMINI_API_KEY=your_gemini_api_key  # Get from https://aistudio.google.com/app/apikey
GROQ_API_KEY=your_groq_api_key  # Get from https://console.groq.com (Fast inference - Kimi K2 recommended)
```

3. **Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  

## Configuration

- Sandbox timeouts and dev server behavior are configurable in `config/app.config.ts`.
  - Default sandbox timeout: **45 minutes** (`appConfig.e2b.timeoutMinutes`).
  - The app passes `timeoutMs` on sandbox creation and reapplies it after reconnects.
  - Adjust this if you see sandbox 502 errors due to timeouts.

### Adjusting sandbox timeout

- Edit `config/app.config.ts`:

```ts
// config/app.config.ts
export const appConfig = {
  e2b: {
    timeoutMinutes: 45, // increase/decrease as needed
    // ...
  }
}
```

- The API ensures timeouts are set when creating and reconnecting to the sandbox.

## Troubleshooting

### Sandbox was not found (502) / timeout

- Increase `timeoutMinutes` in `config/app.config.ts`.
- The server will also call `sandbox.setTimeout(timeoutMs)` after `Sandbox.connect(...)` to extend existing sessions.

### Windows: Lightning CSS / Tailwind native binding errors

If you see errors like:
- `Cannot find module '../lightningcss.win32-x64-msvc.node'`
- `Failed to load native binding ... @tailwindcss/oxide-win32-x64-msvc`

Try:

```bash
npm i lightningcss-win32-x64-msvc@1.30.1 --no-audit --no-fund
npm i @tailwindcss/oxide-win32-x64-msvc@4.1.11 --no-audit --no-fund
```

Also recommended:
- Install the latest Microsoft Visual C++ Redistributable (x64).
- Prefer Node.js 20.x LTS on Windows if Node 22 shows native module issues.
- Ensure a single lockfile. If using npm, delete `pnpm-lock.yaml`.

### Multiple lockfiles warning

- Use one package manager consistently. This repo uses npm by default.
- If you see a warning about multiple lockfiles, remove `pnpm-lock.yaml` and keep `package-lock.json`.

## License

MIT
