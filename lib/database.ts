import { supabase } from './supabase';
import type { 
  Session, Message, Job, Task, Artifact, Sandbox, ToolRun, Checkpoint,
  Database 
} from './supabase';

export class DatabaseService {
  // Session operations
  async createSession(title?: string, metadata?: any): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        title,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return data;
  }

  async getSession(id: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get session: ${error.message}`);
    return data;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update session: ${error.message}`);
    return data;
  }

  async listSessions(limit = 50, offset = 0): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list sessions: ${error.message}`);
    return data || [];
  }

  // Message operations
  async createMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: any): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create message: ${error.message}`);
    return data;
  }

  async getMessages(sessionId: string, limit = 100, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to get messages: ${error.message}`);
    return data || [];
  }

  // Job operations
  async createJob(
    sessionId: string, 
    type: Job['type'], 
    input: any, 
    parentJobId?: string
  ): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        session_id: sessionId,
        type,
        input,
        parent_job_id: parentJobId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create job: ${error.message}`);
    return data;
  }

  async getJob(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get job: ${error.message}`);
    return data;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update job: ${error.message}`);
    return data;
  }

  async listJobs(sessionId: string, limit = 50, offset = 0): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list jobs: ${error.message}`);
    return data || [];
  }

  // Task operations
  async createTask(jobId: string, name: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        job_id: jobId,
        name
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update task: ${error.message}`);
    return data;
  }

  async getTasks(jobId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get tasks: ${error.message}`);
    return data || [];
  }

  // Artifact operations
  async createArtifact(
    jobId: string, 
    type: Artifact['type'], 
    uri: string, 
    size: number, 
    metadata?: any
  ): Promise<Artifact> {
    const { data, error } = await supabase
      .from('artifacts')
      .insert({
        job_id: jobId,
        type,
        uri,
        size,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create artifact: ${error.message}`);
    return data;
  }

  async getArtifacts(jobId: string): Promise<Artifact[]> {
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get artifacts: ${error.message}`);
    return data || [];
  }

  // Sandbox operations
  async createSandbox(
    sessionId: string, 
    sandboxId: string, 
    url: string, 
    metadata?: any
  ): Promise<Sandbox> {
    const { data, error } = await supabase
      .from('sandboxes')
      .insert({
        session_id: sessionId,
        sandbox_id: sandboxId,
        url,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create sandbox: ${error.message}`);
    return data;
  }

  async updateSandbox(id: string, updates: Partial<Sandbox>): Promise<Sandbox> {
    const { data, error } = await supabase
      .from('sandboxes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update sandbox: ${error.message}`);
    return data;
  }

  async getSandbox(sessionId: string): Promise<Sandbox | null> {
    const { data, error } = await supabase
      .from('sandboxes')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .order('last_seen_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get sandbox: ${error.message}`);
    return data;
  }

  // Tool run operations
  async createToolRun(
    jobId: string, 
    tool: string, 
    input: any, 
    output?: any, 
    error?: string, 
    durationMs = 0
  ): Promise<ToolRun> {
    const { data, error: dbError } = await supabase
      .from('tool_runs')
      .insert({
        job_id: jobId,
        tool,
        input,
        output: output || {},
        error,
        duration_ms: durationMs
      })
      .select()
      .single();

    if (dbError) throw new Error(`Failed to create tool run: ${dbError.message}`);
    return data;
  }

  async getToolRuns(jobId: string): Promise<ToolRun[]> {
    const { data, error } = await supabase
      .from('tool_runs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get tool runs: ${error.message}`);
    return data || [];
  }

  // Checkpoint operations
  async createCheckpoint(
    sessionId: string, 
    label: string, 
    snapshotRef: string, 
    metadata?: any
  ): Promise<Checkpoint> {
    const { data, error } = await supabase
      .from('checkpoints')
      .insert({
        session_id: sessionId,
        label,
        snapshot_ref: snapshotRef,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create checkpoint: ${error.message}`);
    return data;
  }

  async getCheckpoints(sessionId: string): Promise<Checkpoint[]> {
    const { data, error } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get checkpoints: ${error.message}`);
    return data || [];
  }

  // Utility methods
  async getSessionWithDetails(sessionId: string) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const [messages, jobs, sandbox, checkpoints] = await Promise.all([
      this.getMessages(sessionId, 50),
      this.listJobs(sessionId, 20),
      this.getSandbox(sessionId),
      this.getCheckpoints(sessionId)
    ]);

    return {
      ...session,
      messages,
      jobs,
      sandbox,
      checkpoints
    };
  }

  async migrateConversationState(conversationState: any): Promise<string> {
    // Create a new session from existing conversation state
    const session = await this.createSession(
      conversationState.context?.currentTopic || 'Migrated Session',
      {
        migratedFrom: 'global_conversation_state',
        originalData: conversationState
      }
    );

    // Migrate messages
    if (conversationState.context?.messages) {
      for (const msg of conversationState.context.messages) {
        await this.createMessage(
          session.id,
          msg.role,
          msg.content,
          msg.metadata
        );
      }
    }

    return session.id;
  }
}

// Export singleton instance
export const db = new DatabaseService();
