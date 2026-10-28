import { CropSymptomDiagnosis } from '../types';
import { diagnoseCropSymptoms } from './crop-symptoms';
import { CopilotMessage, CopilotContext } from './copilot-rag';
import { gemmaService, GemmaImageInput } from './gemma';

export type AIProviderType = 'gemma' | 'gemini' | 'openai' | 'mock';

export class ModularAIProvider {
  private gemmaKey: string | null;

  constructor() {
    this.gemmaKey = process.env.GEMINI_API_KEY || null;
  }

  public getProviderName(): string {
    if (gemmaService.isConfigured()) {
      return `Google Gemma 4 31B (${gemmaService.getModelIdentifier()})`;
    }
    return 'KrishiConnect Agricultural Agronomy Engine (Local Domain)';
  }

  public isLiveLLMConfigured(): boolean {
    return gemmaService.isConfigured();
  }

  /**
   * Diagnostic assessment of crop photos and symptoms using Gemma 4 31B Multimodal
   */
  public async analyzeCropHealth(
    cropType: string,
    symptomsDescription: string,
    imageBase64?: string
  ): Promise<CropSymptomDiagnosis> {
    if (gemmaService.isConfigured()) {
      try {
        let imageInput: GemmaImageInput | undefined;
        if (imageBase64) {
          const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
          const mimeType = (match ? match[1] : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
          const cleanB64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
          imageInput = {
            mimeType,
            base64Data: cleanB64,
          };
        }

        const prompt = `Act as an agricultural plant pathology assistant for Indian farmers.
Evaluate the following crop health issue:
Crop: ${cropType}
Farmer Symptoms Description: ${symptomsDescription}

Provide your evaluation strictly in valid JSON matching this exact structure:
{
  "conditionNameEn": "Possible condition name in English",
  "conditionNameHi": "संभावित रोग/कीट का नाम हिंदी में",
  "confidenceTier": "Moderate",
  "scientificName": "Scientific or pathogen name if applicable",
  "symptomsObserved": ["Symptom 1", "Symptom 2"],
  "favorableWeatherConditions": "Weather conditions that foster this condition",
  "organicManagementEn": ["Organic step 1", "Organic step 2"],
  "organicManagementHi": ["जैविक उपाय 1", "जैविक उपाय 2"],
  "chemicalManagementEn": ["Label-compliant chemical step with safety warning"],
  "chemicalManagementHi": ["सुरक्षा चेतावनी के साथ अनुशंसित रासायनिक उपाय"],
  "precautionsEn": ["Safety precaution 1"],
  "precautionsHi": ["सावधानी 1"],
  "disclaimer": "यह प्राथमिक दृश्य विश्लेषण है। अंतिम पुष्टि हेतु स्थानीय कृषि विज्ञान केंद्र (KVK) अथवा कृषि वैज्ञानिक से संपर्क करें।",
  "requiresExpertVisit": true
}`;

        const gemmaResult = await gemmaService.generateAnswer({
          message: prompt,
          language: 'hi',
          image: imageInput,
        });

        if (gemmaResult && gemmaResult.text) {
          const jsonMatch = gemmaResult.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed as CropSymptomDiagnosis;
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
    if (gemmaService.isConfigured()) {
      try {
        const res = await gemmaService.generateAnswer({
          message: query,
          language,
          context: {
            farmerName: context.farmerName,
            district: context.district,
            activeCrop: context.activeCrop,
            farmSizeAcres: context.farmSizeAcres,
            latestMandiPrice: {
              modalPrice: context.latestMandiModalPrice,
            },
          },
        });

        return {
          id: res.id,
          sender: 'assistant',
          text: res.text,
          timestamp: res.timestamp,
          sources: res.sources,
          suggestedFollowUps: res.suggestedFollowUps,
        };
      } catch {
        // Fallback to local
      }
    }

    // Local verified RAG
    const { generateCopilotResponse } = await import('./copilot-rag');
    return generateCopilotResponse(query, context, language);
  }
}

export const aiProvider = new ModularAIProvider();
