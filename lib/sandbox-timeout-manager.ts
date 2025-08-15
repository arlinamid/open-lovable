import { appConfig } from '@/config/app.config';

export interface TimeoutManagerOptions {
  maxRetries?: number;
  retryDelay?: number;
  processTimeout?: number;
  connectionTimeout?: number;
  autoExtendThreshold?: number;
}

export class SandboxTimeoutManager {
  private sandbox: any;
  private options: TimeoutManagerOptions;
  private lastActivity: number = Date.now();
  private autoExtendTimer?: NodeJS.Timeout;
  private isExtending: boolean = false;

  constructor(sandbox: any, options: TimeoutManagerOptions = {}) {
    this.sandbox = sandbox;
    this.options = {
      maxRetries: appConfig.e2b.maxRetries,
      retryDelay: appConfig.e2b.retryDelay,
      processTimeout: appConfig.e2b.processTimeout,
      connectionTimeout: appConfig.e2b.connectionTimeout,
      autoExtendThreshold: appConfig.e2b.autoExtendThreshold,
      ...options
    };
    
    this.startAutoExtendTimer();
  }

  /**
   * Execute a sandbox operation with timeout and retry logic
   */
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    operationName: string = 'sandbox operation'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.maxRetries!; attempt++) {
      try {
        console.log(`[SandboxTimeoutManager] Executing ${operationName} (attempt ${attempt}/${this.options.maxRetries})`);
        
        // Update last activity
        this.updateLastActivity();
        
        // Execute with timeout
        const result = await this.withTimeout(operation(), this.options.processTimeout!);
        
        console.log(`[SandboxTimeoutManager] ${operationName} completed successfully`);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`[SandboxTimeoutManager] ${operationName} failed (attempt ${attempt}):`, error);
        
        // Check if it's a timeout error
        if (this.isTimeoutError(error as Error)) {
          console.log(`[SandboxTimeoutManager] Timeout detected, attempting to extend sandbox...`);
          
          try {
            await this.extendSandboxTimeout();
            console.log(`[SandboxTimeoutManager] Sandbox timeout extended successfully`);
          } catch (extendError) {
            console.error(`[SandboxTimeoutManager] Failed to extend sandbox timeout:`, extendError);
          }
        }
        
        // If this is the last attempt, throw the error
        if (attempt === this.options.maxRetries) {
          throw new Error(`Failed to execute ${operationName} after ${this.options.maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Wait before retry
        console.log(`[SandboxTimeoutManager] Waiting ${this.options.retryDelay}ms before retry...`);
        await this.delay(this.options.retryDelay!);
      }
    }
    
    throw lastError!;
  }

  /**
   * Execute a sandbox process with timeout
   */
  async executeProcessWithTimeout(
    cmd: string,
    options: any = {}
  ): Promise<any> {
    return this.executeWithTimeout(async () => {
      const process = await this.sandbox.process.start({
        cmd,
        timeout: this.options.processTimeout,
        ...options
      });
      
      await process.wait();
      return process;
    }, `process: ${cmd}`);
  }

  /**
   * Execute sandbox code with timeout
   */
  async executeCodeWithTimeout(
    code: string,
    options: any = {}
  ): Promise<any> {
    return this.executeWithTimeout(async () => {
      return await this.sandbox.runCode(code, {
        timeout: this.options.processTimeout,
        ...options
      });
    }, 'code execution');
  }

  /**
   * Extend sandbox timeout
   */
  async extendSandboxTimeout(): Promise<void> {
    if (this.isExtending) {
      console.log('[SandboxTimeoutManager] Already extending timeout, skipping...');
      return;
    }

    this.isExtending = true;
    
    try {
      if (typeof this.sandbox.setTimeout === 'function') {
        await this.sandbox.setTimeout(appConfig.e2b.timeoutMs);
        console.log(`[SandboxTimeoutManager] Extended sandbox timeout to ${appConfig.e2b.timeoutMinutes} minutes`);
        this.updateLastActivity();
      } else {
        console.warn('[SandboxTimeoutManager] setTimeout method not available on sandbox');
      }
    } finally {
      this.isExtending = false;
    }
  }

  /**
   * Check if sandbox is still active
   */
  async isSandboxActive(): Promise<boolean> {
    try {
      // Try a simple operation to check if sandbox is responsive
      await this.executeWithTimeout(async () => {
        await this.sandbox.runCode('print("ping")');
      }, 'sandbox health check');
      
      return true;
    } catch (error) {
      console.error('[SandboxTimeoutManager] Sandbox health check failed:', error);
      return false;
    }
  }

  /**
   * Get sandbox status information
   */
  getStatus(): {
    lastActivity: number;
    timeSinceLastActivity: number;
    isExtending: boolean;
    autoExtendEnabled: boolean;
  } {
    return {
      lastActivity: this.lastActivity,
      timeSinceLastActivity: Date.now() - this.lastActivity,
      isExtending: this.isExtending,
      autoExtendEnabled: !!this.autoExtendTimer
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.autoExtendTimer) {
      clearInterval(this.autoExtendTimer);
      this.autoExtendTimer = undefined;
    }
  }

  /**
   * Private methods
   */
  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  private startAutoExtendTimer(): void {
    if (this.options.autoExtendThreshold) {
      const checkInterval = Math.min(
        this.options.autoExtendThreshold! * 60 * 1000 / 2, // Check twice before threshold
        60000 // But at most every minute
      );
      
      this.autoExtendTimer = setInterval(async () => {
        try {
          const timeSinceLastActivity = Date.now() - this.lastActivity;
          const thresholdMs = this.options.autoExtendThreshold! * 60 * 1000;
          
          // If we're approaching the timeout threshold, extend it
          if (timeSinceLastActivity > thresholdMs * 0.8) { // 80% of threshold
            console.log('[SandboxTimeoutManager] Auto-extending sandbox timeout...');
            await this.extendSandboxTimeout();
          }
        } catch (error) {
          console.error('[SandboxTimeoutManager] Auto-extend failed:', error);
        }
      }, checkInterval);
      
      console.log(`[SandboxTimeoutManager] Auto-extend timer started (checking every ${checkInterval}ms)`);
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isTimeoutError(error: Error): boolean {
    const timeoutKeywords = ['timeout', '502', 'not found', 'expired', 'terminated'];
    const errorMessage = error.message.toLowerCase();
    
    return timeoutKeywords.some(keyword => errorMessage.includes(keyword));
  }
}

/**
 * Create a timeout manager for a sandbox
 */
export function createTimeoutManager(sandbox: any, options?: TimeoutManagerOptions): SandboxTimeoutManager {
  return new SandboxTimeoutManager(sandbox, options);
}

/**
 * Global timeout manager instance
 */
let globalTimeoutManager: SandboxTimeoutManager | null = null;

export function getGlobalTimeoutManager(): SandboxTimeoutManager | null {
  return globalTimeoutManager;
}

export function setGlobalTimeoutManager(manager: SandboxTimeoutManager | null): void {
  if (globalTimeoutManager) {
    globalTimeoutManager.cleanup();
  }
  globalTimeoutManager = manager;
}
