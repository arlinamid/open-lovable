# Sandbox Timeout Management

This document outlines the comprehensive timeout management solution implemented for E2B sandboxes to prevent and handle timeout issues.

## 🚨 Problem

E2B sandboxes have a default 5-minute timeout, which can cause issues during long-running operations:

- **502 errors**: "The sandbox was not found"
- **Connection timeouts**: Operations fail due to sandbox expiration
- **Data loss**: Work is lost when sandbox times out unexpectedly
- **Poor user experience**: Interrupted workflows

## ✅ Solution Overview

We've implemented a comprehensive timeout management system with the following features:

### 1. **Configurable Timeouts**
- Extended default timeout (45 minutes)
- Process-level timeouts (30 seconds)
- Connection timeouts (15 seconds)
- Auto-extension thresholds

### 2. **Automatic Timeout Extension**
- Proactive timeout extension before expiration
- Configurable extension threshold (5 minutes)
- Automatic retry logic with exponential backoff

### 3. **Health Monitoring**
- Real-time sandbox health checks
- Activity tracking and monitoring
- Automatic recovery mechanisms

### 4. **Retry Logic**
- Configurable retry attempts (3 by default)
- Intelligent error detection
- Graceful degradation

## 🔧 Configuration

### Timeout Settings

Edit `config/app.config.ts` to customize timeout behavior:

```typescript
export const appConfig = {
  e2b: {
    // Main sandbox timeout (45 minutes)
    timeoutMinutes: 45,
    
    // Process timeout for individual commands (30 seconds)
    processTimeout: 30000,
    
    // Connection timeout (15 seconds)
    connectionTimeout: 15000,
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 2000,
    
    // Auto-extend timeout before expiration (5 minutes)
    autoExtendThreshold: 5,
  }
}
```

### Environment Variables

Ensure your `.env.local` has the E2B API key:

```bash
E2B_API_KEY=your_e2b_api_key_here
```

## 🛠️ Implementation Details

### Timeout Manager Class

The `SandboxTimeoutManager` class provides:

```typescript
import { createTimeoutManager } from '@/lib/sandbox-timeout-manager';

// Create a timeout manager for a sandbox
const timeoutManager = createTimeoutManager(sandbox);

// Execute operations with timeout and retry
const result = await timeoutManager.executeCodeWithTimeout(`
  print("Hello World")
`);

// Check sandbox health
const isActive = await timeoutManager.isSandboxActive();

// Extend timeout manually
await timeoutManager.extendSandboxTimeout();
```

### Key Features

1. **Automatic Retry**: Failed operations are retried with exponential backoff
2. **Timeout Detection**: Intelligent detection of timeout-related errors
3. **Health Monitoring**: Continuous monitoring of sandbox responsiveness
4. **Resource Cleanup**: Proper cleanup of timers and resources
5. **Error Recovery**: Automatic timeout extension on timeout errors

## 📡 API Endpoints

### Health Check Endpoint

**GET** `/api/sandbox-health`

Returns sandbox health status and timeout information:

```json
{
  "success": true,
  "sandbox": {
    "sandboxId": "abc123",
    "url": "https://abc123.e2b.app",
    "hasTimeoutManager": true,
    "isActive": true
  },
  "timeoutManager": {
    "lastActivity": 1703123456789,
    "timeSinceLastActivity": 30000,
    "isExtending": false,
    "autoExtendEnabled": true
  },
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### Timeout Management Endpoint

**POST** `/api/sandbox-health`

Actions:
- `extend_timeout`: Manually extend sandbox timeout
- `health_check`: Perform active health check

```json
{
  "action": "extend_timeout"
}
```

## 🧪 Testing

### Run Timeout Tests

```bash
npm run test:timeout
```

This will test:
- Sandbox creation with timeout manager
- Health check functionality
- Timeout extension
- File listing with timeout protection
- Error recovery mechanisms

### Manual Testing

1. **Create a sandbox**:
   ```bash
   curl -X POST http://localhost:3000/api/create-ai-sandbox
   ```

2. **Check health**:
   ```bash
   curl http://localhost:3000/api/sandbox-health
   ```

3. **Extend timeout**:
   ```bash
   curl -X POST http://localhost:3000/api/sandbox-health \
     -H "Content-Type: application/json" \
     -d '{"action": "extend_timeout"}'
   ```

## 🔍 Monitoring and Debugging

### Log Messages

The timeout manager provides detailed logging:

```
[SandboxTimeoutManager] Auto-extend timer started (checking every 30000ms)
[SandboxTimeoutManager] Executing code execution (attempt 1/3)
[SandboxTimeoutManager] Timeout detected, attempting to extend sandbox...
[SandboxTimeoutManager] Extended sandbox timeout to 45 minutes
[SandboxTimeoutManager] Waiting 2000ms before retry...
```

### Status Information

Get detailed status information:

```typescript
const status = timeoutManager.getStatus();
console.log(status);
// {
//   lastActivity: 1703123456789,
//   timeSinceLastActivity: 30000,
//   isExtending: false,
//   autoExtendEnabled: true
// }
```

## 🚀 Best Practices

### 1. **Use Timeout Manager for All Operations**

Instead of direct sandbox calls:

```typescript
// ❌ Don't do this
const result = await sandbox.runCode(code);

// ✅ Do this
const result = await timeoutManager.executeCodeWithTimeout(code);
```

### 2. **Handle Timeout Errors Gracefully**

```typescript
try {
  const result = await timeoutManager.executeCodeWithTimeout(code);
  return result;
} catch (error) {
  if (timeoutManager.isTimeoutError(error)) {
    // Handle timeout specifically
    console.log('Operation timed out, attempting recovery...');
  }
  throw error;
}
```

### 3. **Monitor Sandbox Health**

```typescript
// Check health before critical operations
const isHealthy = await timeoutManager.isSandboxActive();
if (!isHealthy) {
  // Recreate sandbox or handle gracefully
}
```

### 4. **Configure Appropriate Timeouts**

- **Short operations**: Use default process timeout (30s)
- **Long operations**: Increase process timeout or break into chunks
- **Critical operations**: Use manual timeout extension

## 🔧 Troubleshooting

### Common Issues

1. **Sandbox not found (502 error)**
   - Check if sandbox has timed out
   - Use health check endpoint to verify status
   - Recreate sandbox if necessary

2. **Operation timeouts**
   - Increase `processTimeout` in config
   - Break long operations into smaller chunks
   - Use manual timeout extension

3. **Auto-extension not working**
   - Verify `autoExtendThreshold` is set
   - Check if `setTimeout` method is available on sandbox
   - Review logs for extension attempts

### Debug Commands

```bash
# Check sandbox health
curl http://localhost:3000/api/sandbox-health

# Extend timeout manually
curl -X POST http://localhost:3000/api/sandbox-health \
  -H "Content-Type: application/json" \
  -d '{"action": "extend_timeout"}'

# Run comprehensive tests
npm run test:timeout
```

## 📈 Performance Impact

The timeout management system adds minimal overhead:

- **Memory**: ~1KB per timeout manager instance
- **CPU**: Minimal impact from health checks
- **Network**: Small overhead for timeout extensions
- **Latency**: <100ms for timeout manager operations

## 🔮 Future Enhancements

1. **Adaptive Timeouts**: Dynamic timeout adjustment based on operation history
2. **Predictive Extension**: ML-based prediction of when timeouts will occur
3. **Distributed Monitoring**: Multi-instance health monitoring
4. **Advanced Recovery**: Automatic sandbox recreation on failure
5. **Metrics Dashboard**: Real-time timeout and health metrics

## 📚 References

- [E2B Sandbox Documentation](https://e2b.dev/docs/sandbox)
- [E2B Timeout API](https://e2b.dev/docs/sandbox/api/timeouts)
- [E2B GitHub Issues](https://github.com/e2b-dev/E2B/issues/274)
