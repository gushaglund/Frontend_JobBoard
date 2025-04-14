import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest): Promise<NextResponse> {
  return NextResponse.next({ headers: req.headers });
}

// Only keep matchers for dashboard paths that need middleware
export const config = { matcher: ['/dashboard/:path*'] };
