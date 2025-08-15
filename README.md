# Open Lovable

Chat with AI to build React apps instantly. Made by the [Firecrawl](https://firecrawl.dev/?ref=open-lovable-github) team.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="Open Lovable Demo" width="100%"/>

## 🚀 What's New

**Supabase Upgrade Complete!** ✅
- **Persistent Storage**: All conversation data now stored in Supabase
- **Session Management**: Automatic session creation, tracking, and checkpoints
- **Job System Foundation**: Structured job tracking with states and tasks
- **Backward Compatibility**: Existing APIs continue to work while new features use database
- **Migration Path**: Gradual transition from global variables to database-backed storage

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

# Supabase (Required for persistent storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url  # Get from https://supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  # Get from https://supabase.com

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Get from https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key  # Get from https://platform.openai.com (GPT-5)
GEMINI_API_KEY=your_gemini_api_key  # Get from https://aistudio.google.com/app/apikey
GROQ_API_KEY=your_groq_api_key  # Get from https://console.groq.com (Fast inference - Kimi K2 recommended)
```

3. **Set up Supabase Database**
```bash
# Run the database migration in your Supabase SQL Editor
# Copy contents of: supabase/migrations/001_initial_schema.sql
```

4. **Test Setup**
```bash
npm run test:supabase
```

5. **Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  

## 🆕 New Features

### Persistent Storage
- **Sessions**: Track user conversations and project evolution
- **Messages**: Store all conversation messages with metadata
- **Jobs**: Track background operations (code generation, package installation, etc.)
- **Tasks**: Break down jobs into individual steps
- **Artifacts**: Store generated files, logs, and other outputs
- **Sandboxes**: Track E2B sandbox instances
- **Tool Runs**: Log all tool executions for debugging
- **Checkpoints**: Enable session rollback and resumption

### New API Endpoints
- `GET/POST /api/v2/sessions` - Session management
- `GET/POST /api/v2/jobs` - Job tracking
- `GET/POST /api/v2/sessions/{id}/checkpoints` - Checkpoints
- `POST /api/v2/migrate` - Migrate existing conversation state

### Session Management
- Automatic session creation and tracking
- Session checkpoints for rollback
- Session history and timeline
- Gradual migration from global variables

### Sandbox Timeout Management
- **Automatic timeout extension**: Proactive timeout extension before expiration
- **Health monitoring**: Real-time sandbox health checks and activity tracking
- **Retry logic**: Configurable retry attempts with intelligent error detection
- **Process timeouts**: Individual operation timeouts to prevent hanging
- **Auto-recovery**: Automatic timeout extension on timeout errors
- **Health API**: `/api/sandbox-health` for monitoring and manual timeout extension

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
    processTimeout: 30000, // individual process timeout (30s)
    connectionTimeout: 15000, // connection timeout (15s)
    maxRetries: 3, // retry attempts
    retryDelay: 2000, // delay between retries (2s)
    autoExtendThreshold: 5, // auto-extend 5 minutes before expiration
    // ...
  }
}
```

- The API ensures timeouts are set when creating and reconnecting to the sandbox.
- **New**: Comprehensive timeout management with automatic retry, health monitoring, and auto-extension.

## 🗄️ Database Schema

The Supabase database includes 8 tables:
- `sessions` - User sessions and conversation history
- `messages` - Individual messages in conversations  
- `jobs` - Background jobs and their states
- `tasks` - Individual tasks within jobs
- `artifacts` - Generated files, logs, and other artifacts
- `sandboxes` - E2B sandbox instances
- `tool_runs` - Tool execution history
- `checkpoints` - Session checkpoints for rollback

## 🔄 Migration Path

### From Global Variables to Database
1. Existing code continues to work with global variables
2. New v2 APIs use database storage
3. Migration utility available at `/api/v2/migrate`
4. Gradual transition to database-backed storage

### API Evolution
- **Phase 1**: Both v1 (global) and v2 (database) APIs coexist ✅
- **Phase 2**: New features use v2 APIs (In Progress)
- **Phase 3**: Legacy APIs deprecated, full migration to database

## Troubleshooting

### Supabase Setup Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` is in the project root
   - Check that variable names match exactly
   - Restart your development server

2. **"Failed to create session"**
   - Verify your Supabase credentials
   - Check that the database migration ran successfully
   - Ensure your project is not paused

3. **Test Supabase Setup**
   ```bash
   npm run test:supabase
   ```

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

## 📚 Documentation

- [API Reference](docs/API_REFERENCE.md) - Complete API documentation
- [Lib Reference](docs/LIB_REFERENCE.md) - Utility functions and helpers
- [UI Components](docs/UI_COMPONENTS.md) - Component documentation
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Detailed Supabase configuration
- [Upgrade Plan](docs/UPGRADE_PLAN.md) - Future development roadmap

## 🎯 Next Steps

This implementation provides the foundation for:
1. **Job System**: Background job processing with state management
2. **MCP Tool Calling**: Tool execution tracking and history
3. **Session History**: Complete conversation and project timeline
4. **Checkpoints**: Rollback and resumption capabilities
5. **Vector Search**: Code retrieval and RAG capabilities
6. **Authentication**: User management and access control

## License

MIT
