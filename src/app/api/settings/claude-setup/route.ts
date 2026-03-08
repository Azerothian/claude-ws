import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export async function GET() {
  const claudeDir = join(homedir(), '.claude');
  const configured = existsSync(claudeDir);
  return NextResponse.json({ configured });
}
