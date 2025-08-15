# Supabase Setup Guide

This guide will help you set up Supabase for persistent storage in the Open Lovable application.

## Prerequisites

1. A Supabase account (free tier available at https://supabase.com)
2. Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `open-lovable` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the region closest to you
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL (starts with `https://`)
   - Anon public key (starts with `eyJ`)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Existing API Keys (keep your existing values)
E2B_API_KEY=your_e2b_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=your_openai_base_url
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_BASE_URL=your_anthropic_base_url
GEMINI_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Run the Database Migration

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL Editor and click "Run"

This will create all the necessary tables:
- `sessions` - User sessions and conversation history
- `messages` - Individual messages in conversations
- `jobs` - Background jobs and their states
- `tasks` - Individual tasks within jobs
- `artifacts` - Generated files, logs, and other artifacts
- `sandboxes` - E2B sandbox instances
- `tool_runs` - Tool execution history
- `checkpoints` - Session checkpoints for rollback

## Step 5: Install Dependencies

Run the following command to install the Supabase client:

```bash
npm install @supabase/supabase-js
```

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the new API endpoints:
   - Create a session: `POST /api/v2/sessions`
   - List sessions: `GET /api/v2/sessions`
   - Get session details: `GET /api/v2/sessions/{id}?details=true`

## Step 7: Migrate Existing Data (Optional)

If you have existing conversation state, you can migrate it using:

```bash
curl -X POST http://localhost:3000/api/v2/migrate \
  -H "Content-Type: application/json" \
  -d '{"conversationState": {...}}'
```

## API Endpoints

### Sessions
- `GET /api/v2/sessions` - List sessions
- `POST /api/v2/sessions` - Create new session
- `GET /api/v2/sessions/{id}` - Get session details
- `PATCH /api/v2/sessions/{id}` - Update session
- `DELETE /api/v2/sessions/{id}` - Archive session

### Jobs
- `GET /api/v2/jobs?sessionId={id}` - List jobs for session
- `POST /api/v2/jobs` - Create new job
- `GET /api/v2/jobs/{id}` - Get job details
- `PATCH /api/v2/jobs/{id}` - Update job
- `POST /api/v2/jobs/{id}` - Cancel job (with `{"action": "cancel"}`)

### Checkpoints
- `GET /api/v2/sessions/{id}/checkpoints` - List checkpoints
- `POST /api/v2/sessions/{id}/checkpoints` - Create checkpoint

### Migration
- `POST /api/v2/migrate` - Migrate conversation state

## Database Schema

The database includes the following key features:

- **Sessions**: Track user conversations and project evolution
- **Messages**: Store all conversation messages with metadata
- **Jobs**: Track background operations (code generation, package installation, etc.)
- **Tasks**: Break down jobs into individual steps
- **Artifacts**: Store generated files, logs, and other outputs
- **Sandboxes**: Track E2B sandbox instances
- **Tool Runs**: Log all tool executions for debugging
- **Checkpoints**: Enable session rollback and resumption

## Security

The database uses Row Level Security (RLS) with permissive policies for development. For production, you should:

1. Implement proper authentication
2. Add user-specific policies
3. Restrict access based on user roles
4. Enable audit logging

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` is in the project root
   - Check that variable names match exactly
   - Restart your development server

2. **"Failed to create session"**
   - Verify your Supabase credentials
   - Check that the database migration ran successfully
   - Ensure your project is not paused

3. **"Session not found"**
   - Check that the session ID is valid
   - Verify the session hasn't been archived/deleted

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Review the API reference in `docs/API_REFERENCE.md`
- Check the upgrade plan in `docs/UPGRADE_PLAN.md`

## Next Steps

After setting up Supabase, you can:

1. Implement the job system for background operations
2. Add MCP tool calling capabilities
3. Build the new UI with session management
4. Add vector search for code retrieval
5. Implement proper authentication and authorization
