import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string | null;
          status: 'active' | 'archived' | 'deleted';
          metadata: any;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string | null;
          status?: 'active' | 'archived' | 'deleted';
          metadata?: any;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string | null;
          status?: 'active' | 'archived' | 'deleted';
          metadata?: any;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          metadata?: any;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          session_id: string;
          type: 'scrape' | 'plan' | 'generate' | 'apply' | 'install' | 'restart' | 'zip';
          state: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
          input: any;
          output: any;
          error: string | null;
          created_at: string;
          updated_at: string;
          parent_job_id: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: 'scrape' | 'plan' | 'generate' | 'apply' | 'install' | 'restart' | 'zip';
          state?: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
          input: any;
          output?: any;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
          parent_job_id?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          type?: 'scrape' | 'plan' | 'generate' | 'apply' | 'install' | 'restart' | 'zip';
          state?: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
          input?: any;
          output?: any;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
          parent_job_id?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          state: 'pending' | 'running' | 'completed' | 'failed';
          logs: string[];
          started_at: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          name: string;
          state?: 'pending' | 'running' | 'completed' | 'failed';
          logs?: string[];
          started_at?: string | null;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          name?: string;
          state?: 'pending' | 'running' | 'completed' | 'failed';
          logs?: string[];
          started_at?: string | null;
          finished_at?: string | null;
        };
      };
      artifacts: {
        Row: {
          id: string;
          job_id: string;
          type: 'code' | 'zip' | 'log' | 'analysis' | 'screenshot';
          uri: string;
          size: number;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          type: 'code' | 'zip' | 'log' | 'analysis' | 'screenshot';
          uri: string;
          size: number;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          type?: 'code' | 'zip' | 'log' | 'analysis' | 'screenshot';
          uri?: string;
          size?: number;
          metadata?: any;
          created_at?: string;
        };
      };
      sandboxes: {
        Row: {
          id: string;
          session_id: string;
          sandbox_id: string;
          url: string;
          status: 'active' | 'stopped' | 'error';
          last_seen_at: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          session_id: string;
          sandbox_id: string;
          url: string;
          status?: 'active' | 'stopped' | 'error';
          last_seen_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          session_id?: string;
          sandbox_id?: string;
          url?: string;
          status?: 'active' | 'stopped' | 'error';
          last_seen_at?: string;
          metadata?: any;
        };
      };
      tool_runs: {
        Row: {
          id: string;
          job_id: string;
          tool: string;
          input: any;
          output: any;
          error: string | null;
          created_at: string;
          duration_ms: number;
        };
        Insert: {
          id?: string;
          job_id: string;
          tool: string;
          input: any;
          output?: any;
          error?: string | null;
          created_at?: string;
          duration_ms?: number;
        };
        Update: {
          id?: string;
          job_id?: string;
          tool?: string;
          input?: any;
          output?: any;
          error?: string | null;
          created_at?: string;
          duration_ms?: number;
        };
      };
      checkpoints: {
        Row: {
          id: string;
          session_id: string;
          label: string;
          snapshot_ref: string;
          created_at: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          session_id: string;
          label: string;
          snapshot_ref: string;
          created_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          session_id?: string;
          label?: string;
          snapshot_ref?: string;
          created_at?: string;
          metadata?: any;
        };
      };
    };
  };
}

export type Session = Database['public']['Tables']['sessions']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Artifact = Database['public']['Tables']['artifacts']['Row'];
export type Sandbox = Database['public']['Tables']['sandboxes']['Row'];
export type ToolRun = Database['public']['Tables']['tool_runs']['Row'];
export type Checkpoint = Database['public']['Tables']['checkpoints']['Row'];
