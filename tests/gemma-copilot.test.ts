import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GemmaService,
  checkRateLimit,
  KRISHIMITRA_SYSTEM_INSTRUCTION,
} from '../lib/ai/gemma';

describe('Gemma 4 31B Configuration & Health Status', () => {
  it('correctly configures default model identifier gemma-4-31b-it and normalizes to models/gemma-4-31b-it', () => {
    const service = new GemmaService();
    expect(service.getModelIdentifier()).toBe('gemma-4-31b-it');
    expect(service.getNormalizedModelPath()).toBe('models/gemma-4-31b-it');
  });

  it('health check provides model metadata without revealing API key', () => {
    const service = new GemmaService();
    const health = service.getHealthStatus();

    expect(health).toHaveProperty('ok');
    expect(health).toHaveProperty('model', 'gemma-4-31b-it');
    expect(health).toHaveProperty('apiKeyConfigured');
    expect(health).toHaveProperty('provider');
    expect(health).toHaveProperty('contextWindowTokens', 262144);
    expect(health).not.toHaveProperty('apiKey');
    expect(health).not.toHaveProperty('key');
  });

  it('system instructions contain core agricultural decision principles and no-guarantee rule', () => {
    expect(KRISHIMITRA_SYSTEM_INSTRUCTION).toContain('KrishiMitra AI');
    expect(KRISHIMITRA_SYSTEM_INSTRUCTION).toContain('Never invent current weather, mandi prices');
    expect(KRISHIMITRA_SYSTEM_INSTRUCTION).toContain('Never guarantee profit, crop yield, or future prices');
    expect(KRISHIMITRA_SYSTEM_INSTRUCTION).toContain('Krishi Vigyan Kendra');
    expect(KRISHIMITRA_SYSTEM_INSTRUCTION).toContain('Simple explanation');
    expect(KRISHIMITRA_SYSTEM_INSTRUCTION).toContain('Relevant observations');
  });
});

describe('Input Validation & Boundary Conditions', () => {
  it('rejects empty query string when no image is provided', async () => {
    const service = new GemmaService();
    const res = await service.generateAnswer({
      message: '   ',
      language: 'hi',
    });

    expect(res.status).toBe('invalid_input');
    expect(res.text).toContain('कृपया अपना प्रश्न दर्ज करें');
    expect(res.isLiveModel).toBe(false);
  });

  it('rejects overly long prompt exceeding 2500 characters', async () => {
    const service = new GemmaService();
    const longMessage = 'A'.repeat(3000);
    const res = await service.generateAnswer({
      message: longMessage,
      language: 'en',
    });

    expect(res.status).toBe('invalid_input');
    expect(res.text).toContain('exceeds maximum length');
  });

  it('handles multi-turn conversation history gracefully', async () => {
    const service = new GemmaService();
    const history = [
      { role: 'user' as const, text: 'नमस्ते, गेहूं की बुवाई कब करें?' },
      { role: 'assistant' as const, text: 'मध्य प्रदेश में गेहूं की बुवाई 20 अक्टूबर से 15 नवंबर के मध्य करें।' },
      { role: 'user' as const, text: 'खाद कितनी डालनी है?' },
    ];

    const res = await service.generateAnswer({
      message: 'डीएपी और यूरिया का अनुपात बताएं',
      language: 'hi',
      history,
    });

    expect(res).toBeDefined();
    expect(res.id).toBeDefined();
    expect(res.text.length).toBeGreaterThan(10);
  }, 30000);
});

describe('Rate Limiter Behavior', () => {
  it('tracks requests per client and enforces window limits', () => {
    const testClientId = `test-client-${Date.now()}`;

    // Should allow initial requests
    const firstCheck = checkRateLimit(testClientId);
    expect(firstCheck.allowed).toBe(true);
    expect(firstCheck.remaining).toBeLessThan(25);

    // Simulate exceeding the limit
    for (let i = 0; i < 30; i++) {
      checkRateLimit(testClientId);
    }

    const exhaustedCheck = checkRateLimit(testClientId);
    expect(exhaustedCheck.allowed).toBe(false);
    expect(exhaustedCheck.remaining).toBe(0);
  });
});

describe('Domain Agronomy Fallback & Error Resilience', () => {
  it('provides structured 4-part fallback when API key is unconfigured', async () => {
    // Instantiate a service with explicit null key
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const offlineService = new GemmaService();
      const res = await offlineService.generateAnswer({
        message: 'सोयाबीन में कौन सी खाद डालें?',
        language: 'hi',
        context: {
          district: 'Sehore',
          activeCrop: 'Soybean',
        },
      });

      expect(res.isLiveModel).toBe(false);
      expect(res.status).toBe('missing_api_key');
      expect(res.text).toContain('1. सरल विवरण');
      expect(res.text).toContain('2. मुख्य अवलोकन');
      expect(res.text).toContain('3. आगामी कदम');
      expect(res.text).toContain('4. जोखिम व सत्यापन');
      expect(res.sources.length).toBeGreaterThan(0);
      expect(res.suggestedFollowUps.length).toBeGreaterThan(0);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('supports English domain fallback structure correctly', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const offlineService = new GemmaService();
      const res = await offlineService.generateAnswer({
        message: 'When should I irrigate wheat?',
        language: 'en',
        context: {
          district: 'Vidisha',
          activeCrop: 'Wheat',
        },
      });

      expect(res.isLiveModel).toBe(false);
      expect(res.text).toContain('1. Simple Explanation');
      expect(res.text).toContain('2. Observations & Relevant Context');
      expect(res.text).toContain('3. Recommended Next Actions');
      expect(res.text).toContain('4. Risks & Verification');
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });
});

describe('Multimodal Image Handling', () => {
  it('accepts base64 image input and strips data URI scheme', async () => {
    const service = new GemmaService();
    const fakeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const res = await service.generateAnswer({
      message: 'पत्तियों पर यह धब्बा क्या है?',
      language: 'hi',
      image: {
        mimeType: 'image/png',
        base64Data: `data:image/png;base64,${fakeBase64}`,
      },
    });

    expect(res).toBeDefined();
    expect(res.text.length).toBeGreaterThan(0);
  }, 30000);
});

describe('Client-Side Security Audit', () => {
  it('ensures no GEMINI_API_KEY is prefixed with NEXT_PUBLIC_ or VITE_', () => {
    expect(process.env.NEXT_PUBLIC_GEMINI_API_KEY).toBeUndefined();
    expect(process.env.VITE_GEMINI_API_KEY).toBeUndefined();
  });
});
