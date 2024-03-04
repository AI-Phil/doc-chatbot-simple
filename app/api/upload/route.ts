'use server';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdtemp } from 'fs/promises';
import { join } from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = await mkdtemp(join(os.tmpdir(), 'doc-chatbot-simple-'));
    const filePath = join(tempDir, file.name);
    await writeFile(filePath, buffer);
    
    console.log(`File saved at ${filePath}`);
    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Error saving file' });
  }
}
