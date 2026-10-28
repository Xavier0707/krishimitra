import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai/provider';
import { CopilotContext } from '@/lib/ai/copilot-rag';

export async function GET() {
  return NextResponse.json({
    provider: aiProvider.getProviderName(),
    isLiveLLMConfigured: aiProvider.isLiveLLMConfigured(),
    quotaStatus: 'free_tier_ready',
    dataPrivacyNotice: 'No personally identifiable farmer data is sent externally without consent.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, language = 'hi', context } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const defaultContext: CopilotContext = {
      farmerName: 'Ramesh Patel',
      district: 'Sehore',
      activeCrop: 'Soybean',
      farmSizeAcres: 8,
      latestMandiModalPrice: 4680,
    };

    const mergedContext = { ...defaultContext, ...(context || {}) };
    const reply = await aiProvider.askCopilot(query, mergedContext, language);

    return NextResponse.json({
      ...reply,
      providerName: aiProvider.getProviderName(),
      isLiveLLM: aiProvider.isLiveLLMConfigured(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process Copilot query', details: String(error) },
      { status: 500 }
    );
  }
}
