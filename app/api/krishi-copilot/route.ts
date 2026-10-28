import { NextRequest, NextResponse } from 'next/server';
import { gemmaService, AgriculturalContext, ConversationTurn, GemmaImageInput } from '@/lib/ai/gemma';

/**
 * KrishiMitra AI × Google Gemma 4 31B Route Handler
 * Endpoint: /api/krishi-copilot
 * Runtime: Node.js Server-Side (Never exposes API credentials to client)
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'health';

  if (action === 'health') {
    const health = gemmaService.getHealthStatus();
    return NextResponse.json({
      ...health,
      endpoint: '/api/krishi-copilot',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }

  // Admin lightweight probe (only if admin authorization header is supplied)
  if (action === 'probe') {
    const adminToken = req.headers.get('x-admin-probe-token');
    if (!adminToken || adminToken !== process.env.ADMIN_PROBE_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized probe request' }, { status: 401 });
    }

    const testResponse = await gemmaService.generateAnswer({
      message: 'Ping test',
      language: 'en',
    });

    return NextResponse.json({
      probeSuccess: testResponse.status === 'success',
      modelUsed: testResponse.model,
      isLiveModel: testResponse.isLiveModel,
      status: testResponse.status,
    });
  }

  return NextResponse.json({
    name: 'KrishiMitra Agricultural Copilot API',
    model: gemmaService.getModelIdentifier(),
    sdk: '@google/genai',
    status: 'operational',
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce payload size limit (max 6MB to accommodate base64 crop images)
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 6 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Payload size exceeds limit (max 6MB)' },
        { status: 413 }
      );
    }

    const body = await req.json();
    const message = body.message || body.query;
    const language = (body.language === 'en' ? 'en' : 'hi') as 'hi' | 'en';
    const context = body.context as AgriculturalContext | undefined;
    const history = body.history as ConversationTurn[] | undefined;
    const image = body.image as GemmaImageInput | undefined;

    // 2. Validate input message
    if (!message && !image) {
      return NextResponse.json(
        { error: 'Message or image input is required' },
        { status: 400 }
      );
    }

    if (message && typeof message === 'string' && message.length > 2500) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 2500 characters' },
        { status: 400 }
      );
    }

    // 3. Extract Client IP for rate-limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientId = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || 'unknown-client';

    // 4. Invoke Gemma 4 31B Engine
    const result = await gemmaService.generateAnswer({
      message: message || '',
      language,
      context,
      history,
      image,
      clientId,
    });

    // 5. Map status to HTTP codes
    if (result.status === 'rate_limit_exceeded') {
      return NextResponse.json(result, { status: 429 });
    }

    if (result.status === 'invalid_input') {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process Krishi Copilot query',
        details: 'An internal server error occurred while invoking the model service.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
