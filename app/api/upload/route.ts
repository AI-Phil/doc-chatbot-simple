'use server';

import { NextRequest, NextResponse } from 'next/server';
import { saveToVectorCollection } from '../../server/astradb';
export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = await saveToVectorCollection(buffer, 'test-id-1', {docName: "testing document"});
    
    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Error saving file' });
  }
}
