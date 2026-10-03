import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const origin = requestUrl.origin;

  if (error) {
    const errorMsg = encodeURIComponent(errorDescription || error || 'Authentication failed');
    return NextResponse.redirect(`${origin}/?auth_error=${errorMsg}`);
  }

  // Redirect to root with the code query parameter so the client-side Supabase JS client can exchange it
  if (code) {
    return NextResponse.redirect(`${origin}/?code=${code}`);
  }

  return NextResponse.redirect(`${origin}/`);
}
