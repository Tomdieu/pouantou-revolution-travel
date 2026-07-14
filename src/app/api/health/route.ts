import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the current timestamp
  const timestamp = new Date().toISOString();
  
  // Perform basic health checks
  const healthStatus = {
    status: 'healthy',
    timestamp,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    service: 'Pouantou Revolution Travel API',
    checks: {
      database: 'connected', // In a real implementation, you would check actual DB connection
      cache: 'available',    // In a real implementation, you would check actual cache status
      external_apis: 'operational' // In a real implementation, you would check actual API statuses
    }
  };

  return Response.json(healthStatus, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}