import { db } from './database';

export class SessionManager {
  private currentSessionId: string | null = null;

  // Initialize or get current session
  async getCurrentSession(): Promise<string> {
    if (this.currentSessionId) {
      // Verify session still exists
      const session = await db.getSession(this.currentSessionId);
      if (session && session.status === 'active') {
        return this.currentSessionId;
      }
    }

    // Create new session
    const session = await db.createSession('New Session');
    this.currentSessionId = session.id;
    return session.id;
  }

  // Set current session
  setCurrentSession(sessionId: string) {
    this.currentSessionId = sessionId;
  }

  // Get current session ID
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // Add message to current session
  async addMessage(role: 'user' | 'assistant' | 'system', content: string, metadata?: any): Promise<string> {
    const sessionId = await this.getCurrentSession();
    const message = await db.createMessage(sessionId, role, content, metadata);
    return message.id;
  }

  // Create a job in current session
  async createJob(type: 'scrape' | 'plan' | 'generate' | 'apply' | 'install' | 'restart' | 'zip', input: any, parentJobId?: string): Promise<string> {
    const sessionId = await this.getCurrentSession();
    const job = await db.createJob(sessionId, type, input, parentJobId);
    return job.id;
  }

  // Update job state
  async updateJob(jobId: string, updates: any): Promise<void> {
    await db.updateJob(jobId, updates);
  }

  // Create sandbox for current session
  async createSandbox(sandboxId: string, url: string, metadata?: any): Promise<string> {
    const sessionId = await this.getCurrentSession();
    const sandbox = await db.createSandbox(sessionId, sandboxId, url, metadata);
    return sandbox.id;
  }

  // Update sandbox
  async updateSandbox(sandboxId: string, updates: any): Promise<void> {
    const sessionId = await this.getCurrentSession();
    const sandbox = await db.getSandbox(sessionId);
    if (sandbox && sandbox.sandbox_id === sandboxId) {
      await db.updateSandbox(sandbox.id, updates);
    }
  }

  // Create checkpoint for current session
  async createCheckpoint(label: string, snapshotRef: string, metadata?: any): Promise<string> {
    const sessionId = await this.getCurrentSession();
    const checkpoint = await db.createCheckpoint(sessionId, label, snapshotRef, metadata);
    return checkpoint.id;
  }

  // Get session details
  async getSessionDetails(): Promise<any> {
    const sessionId = await this.getCurrentSession();
    return await db.getSessionWithDetails(sessionId);
  }

  // Migrate from global conversation state
  async migrateFromGlobalState(conversationState: any): Promise<string> {
    const sessionId = await db.migrateConversationState(conversationState);
    this.currentSessionId = sessionId;
    return sessionId;
  }

  // Clear current session
  clearCurrentSession() {
    this.currentSessionId = null;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
