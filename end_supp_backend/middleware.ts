import { NextRequest, NextResponse } from "next/server";

/**
 * CORS middleware for the FE <-> BE split (localhost:3000 -> localhost:3001).
 * - Handles preflight (OPTIONS)
 * - Adds CORS headers to all /api responses
 */
export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    let allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:3000').trim();
    // Allow env to be either "http://localhost:3000" or "localhost:3000"
    if (allowedOrigin && !allowedOrigin.startsWith('http://') && !allowedOrigin.startsWith('https://')) {
        allowedOrigin = `http://${allowedOrigin}`;
    }

    // Allow only the configured frontend origin.
    const corsOrigin = origin === allowedOrigin ? origin : allowedOrigin;

    const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
}

export const config = {
    matcher: ['/api/:path*'],
};
