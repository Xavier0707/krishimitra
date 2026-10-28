import { NextRequest, NextResponse } from 'next/server';
import { evaluateCropSuitability } from '@/lib/soil/guidance';
import { SoilTestResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: SoilTestResult = await req.json();

    if (body.ph === undefined || body.nitrogenKgHa === undefined) {
      return NextResponse.json(
        { error: 'Valid soil test readings (pH, Nitrogen, etc.) are required.' },
        { status: 400 }
      );
    }

    const assessments = evaluateCropSuitability(body);

    return NextResponse.json({
      assessments,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to evaluate soil report', details: String(error) },
      { status: 500 }
    );
  }
}
