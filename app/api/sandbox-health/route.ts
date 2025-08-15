import { NextResponse } from 'next/server';
import { getGlobalTimeoutManager } from '@/lib/sandbox-timeout-manager';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export async function GET() {
  try {
    if (!global.activeSandbox) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox',
        status: 'inactive'
      }, { status: 404 });
    }

    const timeoutManager = getGlobalTimeoutManager();
    
    // Basic sandbox info
    const sandboxInfo = {
      sandboxId: global.sandboxData?.sandboxId || 'unknown',
      url: global.sandboxData?.url || 'unknown',
      hasTimeoutManager: !!timeoutManager
    };

    // Get timeout manager status if available
    let timeoutStatus = null;
    if (timeoutManager) {
      timeoutStatus = timeoutManager.getStatus();
      
      // Check if sandbox is still responsive
      try {
        const isActive = await timeoutManager.isSandboxActive();
        sandboxInfo.isActive = isActive;
      } catch (error) {
        console.error('[sandbox-health] Health check failed:', error);
        sandboxInfo.isActive = false;
      }
    }

    return NextResponse.json({
      success: true,
      sandbox: sandboxInfo,
      timeoutManager: timeoutStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[sandbox-health] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      status: 'error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (!global.activeSandbox) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox'
      }, { status: 404 });
    }

    const timeoutManager = getGlobalTimeoutManager();
    
    switch (action) {
      case 'extend_timeout':
        if (timeoutManager) {
          await timeoutManager.extendSandboxTimeout();
          return NextResponse.json({
            success: true,
            message: 'Sandbox timeout extended successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Timeout manager not available'
          }, { status: 400 });
        }
        
      case 'health_check':
        if (timeoutManager) {
          const isActive = await timeoutManager.isSandboxActive();
          return NextResponse.json({
            success: true,
            isActive,
            status: isActive ? 'healthy' : 'unresponsive'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Timeout manager not available'
          }, { status: 400 });
        }
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: extend_timeout, health_check'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[sandbox-health] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
