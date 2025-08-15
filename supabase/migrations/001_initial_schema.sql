-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('scrape', 'plan', 'generate', 'apply', 'install', 'restart', 'zip')),
  state TEXT DEFAULT 'queued' CHECK (state IN ('queued', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  input JSONB NOT NULL,
  output JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parent_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state TEXT DEFAULT 'pending' CHECK (state IN ('pending', 'running', 'completed', 'failed')),
  logs TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Create artifacts table
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('code', 'zip', 'log', 'analysis', 'screenshot')),
  uri TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sandboxes table
CREATE TABLE sandboxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sandbox_id TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'error')),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create tool_runs table
CREATE TABLE tool_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER DEFAULT 0
);

-- Create checkpoints table
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  snapshot_ref TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_jobs_session_id ON jobs(session_id);
CREATE INDEX idx_jobs_state ON jobs(state);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_tasks_job_id ON tasks(job_id);
CREATE INDEX idx_artifacts_job_id ON artifacts(job_id);
CREATE INDEX idx_sandboxes_session_id ON sandboxes(session_id);
CREATE INDEX idx_sandboxes_sandbox_id ON sandboxes(sandbox_id);
CREATE INDEX idx_tool_runs_job_id ON tool_runs(job_id);
CREATE INDEX idx_checkpoints_session_id ON checkpoints(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict these later)
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on artifacts" ON artifacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on sandboxes" ON sandboxes FOR ALL USING (true);
CREATE POLICY "Allow all operations on tool_runs" ON tool_runs FOR ALL USING (true);
CREATE POLICY "Allow all operations on checkpoints" ON checkpoints FOR ALL USING (true);
