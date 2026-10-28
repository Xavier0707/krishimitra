import { CropSymptomDiagnosis } from '../types';
import { diagnoseCropSymptoms } from './crop-symptoms';
import { generateCopilotResponse, CopilotMessage, CopilotContext } from './copilot-rag';

export type AIProviderType = 'gemini' | 'openai' | 'mock';

export class ModularAIProvider {
  private provider: AIProviderType;
  private geminiKey: string | null;
  private openaiKey: string | null;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProviderType) || 'mock';
    this.geminiKey = process.env.GEMINI_API_KEY || null;
    this.openaiKey = process.env.OPENAI_API_KEY || null;
  }

  public getProviderName(): string {
    if (this.geminiKey) return 'Google Gemini Vision & LLM';
    if (this.openaiKey) return 'OpenAI GPT-4o';
    return 'KrishiConnect Agricultural Agronomy Engine (Local Domain)';
  }

  public isLiveLLMConfigured(): boolean {
    return Boolean(this.geminiKey || this.openaiKey);
  }

  /**
   * Diagnostic assessment of crop photos and symptoms
   */
  public async analyzeCropHealth(
    cropType: string,
    symptomsDescription: string,
    imageBase64?: string
  ): Promise<CropSymptomDiagnosis> {
    // If Gemini API is configured with key
    if (this.geminiKey && this.geminiKey.trim().length > 10) {
      try {
        const prompt = `You are an expert agricultural plant pathologist specializing in Indian crops (Madhya Pradesh).
Crop: ${cropType}
Farmer Symptoms Description: ${symptomsDescription}
Please evaluate the provided image and description. Distinguish preliminary possibilities from confirmed diagnoses. Provide safe, verified cultural, organic, and label-compliant chemical recommendations. If uncertain, recommend consulting local KVK.
Respond in valid JSON matching this schema:
{
  "conditionNameEn": "string",
  "conditionNameHi": "string",
  "confidenceTier": "High" | "Moderate" | "Preliminary Observation",
  "scientificName": "string",
  "symptomsObserved": ["string"],
  "favorableWeatherConditions": "string",
  "organicManagementEn": ["string"],
  "organicManagementHi": ["string"],
  "chemicalManagementEn": ["string"],
  "chemicalManagementHi": ["string"],
  "precautionsEn": ["string"],
  "precautionsHi": ["string"],
  "disclaimer": "string",
  "requiresExpertVisit": boolean
}`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
        const parts: Array<Record<string, unknown>> = [{ text: prompt }];

        if (imageBase64) {
          // clean base64 string
          const cleanB64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          parts.push({
            inline_data: {
              mime_type: 'image/jpeg',
              data: cleanB64,
            },
          });
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] }),
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return parsed as CropSymptomDiagnosis;
            }
          }
        }
      } catch {
        // Fallback gracefully to domain knowledge base
      }
    }

    // Default: Domain knowledge engine (Deterministic, transparent, offline-ready)
    return diagnoseCropSymptoms(cropType, symptomsDescription);
  }

  /**
   * Krishi Copilot conversational query
   */
  public async askCopilot(
    query: string,
    context: CopilotContext,
    language: 'hi' | 'en' = 'hi'
  ): Promise<CopilotMessage> {
    // If Gemini key is available
    if (this.geminiKey && this.geminiKey.trim().length > 10) {
      try {
        const systemPrompt = `You are Krishi Copilot, a helpful, honest agricultural decision intelligence assistant for farmers in Madhya Pradesh, India.
Farmer: ${context.farmerName}, District: ${context.district}, Current Crop: ${context.activeCrop}, Farm: ${context.farmSizeAcres} acres.
Language: ${language === 'hi' ? 'Hindi (Simple rural Hindi terms)' : 'English'}.
Rules:
1. Never hallucinate fake prices or claim 100% yield guarantees.
2. Provide grounded, practical advice with actionable steps.
3. Always include 1-2 verified reference sources (ICAR, KVK, Agmarknet, Open-Meteo).
4. Provide 2-3 helpful follow-up questions.`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  { text: `Farmer query: "${query}"` },
                ],
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              id: `msg-${Date.now()}`,
              sender: 'assistant',
              text: reply,
              timestamp: new Date().toISOString(),
              sources: [
                {
                  title: 'Gemini AI Agricultural Model with ICAR Agronomy Knowledge',
                  organization: 'KrishiConnect AI Provider',
                },
              ],
              suggestedFollowUps: [
                language === 'hi' ? 'मंडी भाव और शुद्ध मुनाफा जांचें' : 'Check mandi price and net profit',
                language === 'hi' ? 'मौसम जोखिम सलाह देखें' : 'View weather risk advisory',
              ],
            };
          }
        }
      } catch {
        // Fallback to domain RAG
      }
    }

    // Local verified RAG
    return generateCopilotResponse(query, context, language);
  }
}

export const aiProvider = new ModularAIProvider();
