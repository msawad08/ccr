import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
  } catch (err) {
    console.error('Error reading env file:', err);
  }
  return result;
}

export async function GET() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPath = path.join(process.cwd(), '.env');

  let hasCommentedLines = false;

  // Fallback: Read directly from .env.local or .env if process.env hasn't been reloaded yet
  if (!url || !anonKey) {
    const localParsed = parseEnvFile(envLocalPath);
    const standardParsed = parseEnvFile(envPath);

    url = url || localParsed['NEXT_PUBLIC_SUPABASE_URL'] || standardParsed['NEXT_PUBLIC_SUPABASE_URL'] || '';
    anonKey = anonKey || localParsed['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || standardParsed['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

    // Check if the user accidentally left the lines commented with #
    if ((!url || !anonKey) && fs.existsSync(envLocalPath)) {
      try {
        const rawContent = fs.readFileSync(envLocalPath, 'utf-8');
        if (
          rawContent.includes('# NEXT_PUBLIC_SUPABASE_URL') ||
          rawContent.includes('# NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
          rawContent.includes('#NEXT_PUBLIC_SUPABASE_URL') ||
          rawContent.includes('#NEXT_PUBLIC_SUPABASE_ANON_KEY')
        ) {
          hasCommentedLines = true;
        }
      } catch {
        // ignore
      }
    }
  }

  const configured = Boolean(url && anonKey && url.length > 0 && anonKey.length > 0);

  return NextResponse.json({
    configured,
    url: configured ? url : null,
    anonKey: configured ? anonKey : null,
    hasCommentedLines,
  });
}
