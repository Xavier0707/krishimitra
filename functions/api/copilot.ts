// Cloudflare Pages Function for /api/copilot
// Zero-cost serverless endpoint on Cloudflare Pages edge

export async function onRequestPost(context: { request: Request; env: Record<string, string> }) {
  try {
    const body = (await context.request.json()) as {
      query?: string;
      language?: string;
      context?: Record<string, unknown>;
    };

    const query = body.query || '';
    const language = body.language || 'hi';
    const geminiKey = context.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
        const systemPrompt = `You are Krishi Copilot, a helpful agricultural decision assistant for farmers in Madhya Pradesh, India. Language: ${
          language === 'hi' ? 'Hindi' : 'English'
        }. Provide honest, practical agronomy advice with ICAR/KVK reference sources.`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\nFarmer query: "${query}"` }] }],
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
                id: `msg-${Date.now()}`,
                sender: 'assistant',
                text: reply,
                timestamp: new Date().toISOString(),
                providerName: 'Google Gemini 1.5 Flash (Free Tier)',
                isLiveLLM: true,
                sources: [
                  {
                    title: 'ICAR Agronomy Guidance & Gemini AI Model',
                    organization: 'KrishiConnect AI Provider',
                  },
                ],
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch {
        // Fallback to local
      }
    }

    // Local Domain Knowledge Fallback
    const fallbackTextHi = `आपके सवाल ("${query}") के संबंध में:\n\n1. **सिंचाई व उर्वरक प्रबंधन:** मध्य प्रदेश की काली मिट्टी में गेहूं हेतु पहली सिंचाई बुवाई के 21 दिन पर और दूसरा पानी बाली निकलने से पूर्व दें।\n2. **मंडी सलाह:** स्थानीय सीहोर मंडी और इंदौर के भावों की तुलना करके ही माल ले जाने का निर्णय लें।\n3. **अधिकृत सलाह:** किसी भी जटिल कीट-रोग के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) अथवा ब्लॉक कृषि अधिकारी से संपर्क करें।`;

    return new Response(
      JSON.stringify({
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: fallbackTextHi,
        timestamp: new Date().toISOString(),
        providerName: 'KrishiConnect Agronomy Engine (Local Domain)',
        isLiveLLM: false,
        sources: [
          {
            title: 'भारतीय गेहूं एवं जौ अनुसंधान संस्थान (ICAR-IIWBR)',
            organization: 'ICAR',
          },
        ],
        suggestedFollowUps: [
          'गेहूं में पहली सिंचाई पर कौन सी खाद डालें?',
          'आज सीहोर मंडी में क्या भाव है?',
        ],
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
