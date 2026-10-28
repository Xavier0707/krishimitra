import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, symptomsDescription, imageBase64 } = body;

    if (!cropType || !symptomsDescription) {
      return NextResponse.json(
        { error: 'Crop type and symptoms description are required.' },
        { status: 400 }
      );
    }

    const diagnosis = await aiProvider.analyzeCropHealth(
      cropType,
      symptomsDescription,
      imageBase64
    );

    return NextResponse.json({
      diagnosis,
      provider: aiProvider.getProviderName(),
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process crop diagnosis', details: String(error) },
      { status: 500 }
    );
  }
}
