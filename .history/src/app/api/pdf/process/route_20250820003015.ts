import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, processPDF } from '@/lib/cloudflare-r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!action || !['merge', 'split', 'compress', 'convert'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Process PDF and upload to Cloudflare R2
    const result = await processPDF(file, action as any);

    return NextResponse.json({
      success: true,
      previewUrl: result.previewUrl,
      downloadKey: result.downloadKey,
      message: `PDF ${action} completed successfully!`,
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PDF processing API endpoint' });
}
