import { NextRequest, NextResponse } from 'next/server';
import { gemmaService, AgriculturalContext, ConversationTurn, GemmaImageInput } from '@/lib/ai/gemma';

/**
 * Krishi Copilot API (Backward Compatibility & Alias to /api/krishi-copilot)
 * Powered by Google Gemma 4 31B
 */

export async function GET() {
  const health = gemmaService.getHealthStatus();
  return NextResponse.json({
    ...health,
    aliasOf: '/api/krishi-copilot',
    provider: 'Google Gemma 4 31B (@google/genai)',
    isLiveLLMConfigured: gemmaService.isConfigured(),
    quotaStatus: 'active_free_tier',
    dataPrivacyNotice: 'No personally identifiable farmer data is stored or transmitted insecurely.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.query || body.message;
    const language = (body.language === 'en' ? 'en' : 'hi') as 'hi' | 'en';
    const context = body.context as AgriculturalContext | undefined;
    const history = body.history as ConversationTurn[] | undefined;
    const image = body.image as GemmaImageInput | undefined;

    if (!message && !image) {
      return NextResponse.json({ error: 'Query or message is required.' }, { status: 400 });
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientId = (forwardedFor ? forwardedFor.split(',')[0].trim() : 'client') || 'client';

    const reply = await gemmaService.generateAnswer({
      message: message || '',
      language,
      context,
      history,
      image,
      clientId,
    });

    return NextResponse.json({
      ...reply,
      providerName: `Google Gemma 4 31B (${gemmaService.getModelIdentifier()})`,
      isLiveLLM: reply.isLiveModel,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process Copilot query', details: String(error) },
      { status: 500 }
    );
  }
}
