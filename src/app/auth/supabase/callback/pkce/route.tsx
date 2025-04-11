import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthApiError } from '@supabase/supabase-js';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// NOTE: If you have a proxy in front of this app
//  the request origin might be a local address.
//  Consider using `config.site.url` from `@/config` instead.

// NOTE: This is not a `Page` because we only redirect and it will never render React content.

export async function GET(req: NextRequest): Promise<NextResponse> {
  console.log('GET request received'); // Logs when the request starts

  const { searchParams, origin } = req.nextUrl;

  // Log the entire searchParams object
  console.log('Search Params:', searchParams.toString());

  // Check for an error in the URL query parameters
  if (searchParams.get('error')) {
    console.log('Error received:', searchParams.get('error'), 'Description:', searchParams.get('error_description'));
    return NextResponse.json({ error: searchParams.get('error_description') || 'Something went wrong' });
  }

  const code = searchParams.get('code');
  console.log('Authorization Code:', code); // Log the authorization code

  if (!code) {
    console.log('No code found in the request');
    return NextResponse.json({ error: 'Code is missing' });
  }

  console.log('Creating Supabase client...');
  const cookieStore = cookies();
  const supabaseClient = createClient(cookieStore);

  try {
    console.log('Exchanging code for session...');
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (error) {
      console.log('Error during code exchange:', error.message);
      return NextResponse.json({ error: error.message });
    }

    console.log('Code exchange successful, session created');
  } catch (err) {
    console.log('Exception caught during authentication:', err);

    if (err instanceof AuthApiError && err.message.includes('code and code verifier should be non-empty')) {
      console.log('Code verifier issue detected');
      return NextResponse.json({ error: 'Please open the link in the same browser' });
    }

    logger.error('Callback error', err);
    return NextResponse.json({ error: 'Something went wrong' });
  }

  const next = searchParams.get('next') || paths.dashboard.overview;
  console.log('Redirecting to:', next);

  return NextResponse.redirect(new URL(next, 'https://jobslist.searchfundfellows.com/dashboard'));
}
