// Cloudflare Pages Function for /api/krishi-copilot
// Edge runtime supporting Gemma 4 31B

export async function onRequestGet(context: { request: Request; env: Record<string, string> }) {
  const model = context.env.GEMMA_MODEL || 'gemma-4-31b-it';
  const hasKey = Boolean(context.env.GEMINI_API_KEY && context.env.GEMINI_API_KEY.trim().length > 0);

  return new Response(
    JSON.stringify({
      ok: hasKey,
      model,
      apiKeyConfigured: hasKey,
      provider: 'Google Gemma 4 31B (Cloudflare Edge)',
      endpoint: '/api/krishi-copilot',
      timestamp: new Date().toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function onRequestPost(context: { request: Request; env: Record<string, string> }) {
  try {
    const body = (await context.request.json()) as {
      message?: string;
      query?: string;
      language?: string;
      context?: Record<string, unknown>;
      history?: Array<{ role: string; text: string }>;
    };

    const query = body.message || body.query || '';
    const language = body.language === 'en' ? 'en' : 'hi';
    const geminiKey = context.env.GEMINI_API_KEY;
    const model = context.env.GEMMA_MODEL || 'gemma-4-31b-it';

    if (!query) {
      return new Response(JSON.stringify({ error: 'Message or query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`;
        const systemInstruction = `You are KrishiMitra AI, a responsible agricultural information and decision-support assistant for Indian farmers.
Communicate primarily in simple Hindi or Hinglish, matching the user's preferred language. Keep explanations practical, respectful, and easy to understand.
Help with crop cultivation questions, weather interpretation, mandi-price interpretation, farm-cost calculations, soil reports, crop symptoms, and agricultural planning.
Structure response as:
1. Simple explanation.
2. Relevant observations or supporting information.
3. Recommended next checks or actions.
4. Risks, uncertainty, or verification requirements.
Never guarantee crop yields, profits, or future prices.`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: query }],
              },
            ],
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return new Response(
              JSON.stringify({
                id: `gemma-edge-${Date.now()}`,
                sender: 'assistant',
                text: reply,
                timestamp: new Date().toISOString(),
                model,
                isLiveModel: true,
                sources: [
                  {
                    title: `Google Gemma 4 31B Instruction-Tuned (${model})`,
                    organization: 'Google DeepMind & Cloudflare Edge',
                  },
                  {
                    title: 'भारतीय कृषि अनुसंधान परिषद (ICAR) संदर्शिका',
                    organization: 'Ministry of Agriculture, GoI',
                  },
                ],
                suggestedFollowUps: [
                  language === 'hi' ? 'सीहोर और इंदौर मंडी भाव देखें' : 'Check mandi prices',
                  language === 'hi' ? 'मौसम जोखिम सलाह देखें' : 'View weather risks',
                ],
                status: 'success',
                statutoryDisclaimer:
                  language === 'hi'
                    ? 'कृषि सलाह निर्णय-सहायता हेतु है। रासायनिक उपयोग से पूर्व केवीके व लेबल निर्देशों की पुष्टि करें।'
                    : 'Agricultural advisory is for decision support. Verify pesticide dosages with official label guidance.',
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch {
        // Fallback to domain response
      }
    }

    // Local Domain Agronomy Fallback
    const fallbackTextHi = `**1. सरल विवरण:**\nआपके प्रश्न ("${query}") के संबंध में मध्य प्रदेश की काली मिट्टी में पोषक तत्व प्रबंधन एवं संतुलित सिंचाई अत्यंत आवश्यक है।\n\n**2. मुख्य अवलोकन:**\n• क्रांतिक अवस्थाओं पर सिंचाई व संतुलित उर्वरक का प्रयोग करें।\n• दैनिक मंडी भाव के अंतर का आकलन करने के बाद ही बिक्री का फैसला लें।\n\n**3. आगामी कदम:**\n• नजदीकी कृषि विज्ञान केंद्र (KVK) अथवा कृषि अधिकारी से परामर्श लें।\n\n**4. जोखिम व सत्यापन:**\n• बिना अधिकृत लेबल के कीटनाशकों का छिड़काव न करें।`;

    return new Response(
      JSON.stringify({
        id: `fallback-${Date.now()}`,
        sender: 'assistant',
        text: fallbackTextHi,
        timestamp: new Date().toISOString(),
        model,
        isLiveModel: false,
        sources: [
          {
            title: 'भारतीय कृषि अनुसंधान परिषद (ICAR)',
            organization: 'ICAR',
          },
        ],
        suggestedFollowUps: [
          'गेहूं में पहली सिंचाई का सही समय क्या है?',
          'आज मंडी में क्या भाव है?',
        ],
        status: 'fallback_domain',
        statutoryDisclaimer: 'स्थानीय कृषि ज्ञानकोश सक्रिय है।',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process query', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
