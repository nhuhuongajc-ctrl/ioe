import { GoogleGenAI, Type } from '@google/genai';
import { IOEQuestion, IOESkill, InteractionFamily, InteractionSubtype } from '../../../src/shared/types/ioe.js';

export interface GenerateDraftRequest {
  grade: number;
  skill: IOESkill;
  topic: string;
  count: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  interactionFamily?: InteractionFamily;
  interactionSubtype?: InteractionSubtype;
  keywords?: string[];
}

export class GeminiQuestionGenerator {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      }
    }
    return this.ai;
  }

  async generateDraftQuestions(req: GenerateDraftRequest): Promise<IOEQuestion[]> {
    const aiClient = this.getClient();
    if (!aiClient) {
      console.warn('GEMINI_API_KEY not found, generating local fallback questions.');
      return this.generateFallbackQuestions(req);
    }

    try {
      const prompt = `You are an expert curriculum designer and exam creator for the Vietnamese National IOE (Internet Olympiads in English) Competition for school students.
Create ${req.count || 3} high-quality, authentic IOE exam questions for Grade ${req.grade} students.
Skill: ${req.skill}
Topic: ${req.topic}
Difficulty: Level ${req.difficulty} (on a scale 1 to 5)
Interaction Family: ${req.interactionFamily || 'choice'}
Interaction Subtype: ${req.interactionSubtype || 'single'}
${req.keywords && req.keywords.length > 0 ? `Target vocabulary / grammar keywords: ${req.keywords.join(', ')}` : ''}

Strict Rules:
1. Questions must be age-appropriate for Vietnamese students in Grade ${req.grade}.
2. Provide 4 distinct options for multiple choice (A, B, C, D) with plausible distractors, or tokens for ordering, or matching pairs.
3. Include accurate Vietnamese explanation ('explanation') explaining why the correct answer is right and why distractors are wrong.
4. Include Vietnamese meaning of the sentence/word ('vietnameseMeaning').
5. Never introduce typos or ambiguous answers. Exactly one answer must be strictly correct.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of generated IOE draft questions',
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING, description: 'Question prompt text with blank or question sentence' },
                passage: { type: Type.STRING, description: 'Optional reading passage or context dialogue' },
                missingLetterPattern: { type: Type.STRING, description: 'Optional pattern like w _ n d _ w for missing letters' },
                interactionFamily: { type: Type.STRING, description: 'choice, text-entry, ordering, matching, or listening' },
                interactionSubtype: { type: Type.STRING, description: 'single, short-answer, missing-letters, tokens, or pairs' },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING, description: 'A, B, C, or D' },
                      text: { type: Type.STRING }
                    },
                    required: ['id', 'label', 'text']
                  }
                },
                tokens: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: ['id', 'text']
                  }
                },
                correctOptionId: { type: Type.STRING },
                acceptedAnswers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                orderedTokenIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                explanation: { type: Type.STRING, description: 'Detailed explanation in Vietnamese' },
                vietnameseMeaning: { type: Type.STRING, description: 'Vietnamese translation' },
                pronunciationIpa: { type: Type.STRING, description: 'IPA phonetic representation' }
              },
              required: ['prompt', 'explanation', 'vietnameseMeaning']
            }
          }
        }
      });

      const rawJson = response.text ? response.text.trim() : '[]';
      const parsedItems = JSON.parse(rawJson);

      const draftQuestions: IOEQuestion[] = parsedItems.map((item: any, idx: number) => {
        const family = (item.interactionFamily as InteractionFamily) || req.interactionFamily || 'choice';
        const subtype = (item.interactionSubtype as InteractionSubtype) || req.interactionSubtype || 'single';

        return {
          id: `draft-ai-${Date.now()}-${idx + 1}`,
          version: 1,
          grade: req.grade,
          skill: req.skill,
          topic: req.topic,
          difficulty: req.difficulty,
          interaction: {
            family,
            subtype,
            variant: family === 'ordering' ? 'sentence' : family === 'text-entry' ? 'single-input' : 'text-options'
          },
          prompt: item.prompt || 'Choose the correct answer:',
          passage: item.passage || undefined,
          missingLetterPattern: item.missingLetterPattern || undefined,
          options: item.options || [
            { id: 'opt-a', label: 'A', text: 'Option A' },
            { id: 'opt-b', label: 'B', text: 'Option B' },
            { id: 'opt-c', label: 'C', text: 'Option C' },
            { id: 'opt-d', label: 'D', text: 'Option D' }
          ],
          tokens: item.tokens || undefined,
          answer: {
            correctOptionId: item.correctOptionId || (item.options && item.options[0]?.id) || 'opt-a',
            acceptedAnswers: item.acceptedAnswers || [],
            orderedTokenIds: item.orderedTokenIds || [],
            explanation: item.explanation || 'Giải thích chi tiết đáp án đúng.',
            vietnameseMeaning: item.vietnameseMeaning || '',
            pronunciationIpa: item.pronunciationIpa || ''
          },
          source: {
            provider: 'ai_draft',
            license: 'AI-Generated-Draft',
            provenance: 'Gemini 3.7 Flash IOE Generator'
          },
          qualityStatus: 'review_required', // Question Factory requires teacher approval!
          statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      return draftQuestions;
    } catch (error) {
      console.error('Error in GeminiQuestionGenerator:', error);
      return this.generateFallbackQuestions(req);
    }
  }

  private generateFallbackQuestions(req: GenerateDraftRequest): IOEQuestion[] {
    const timestamp = Date.now();
    return [
      {
        id: `draft-fallback-${timestamp}-1`,
        version: 1,
        grade: req.grade,
        skill: req.skill,
        topic: req.topic || 'General Vocabulary',
        difficulty: req.difficulty || 2,
        interaction: {
          family: 'choice',
          subtype: 'single',
          variant: 'text-options'
        },
        prompt: `Which word is most closely related to the topic of "${req.topic || 'Daily Activities'}"?`,
        options: [
          { id: 'opt-1', label: 'A', text: 'Breakfast' },
          { id: 'opt-2', label: 'B', text: 'Mountain' },
          { id: 'opt-3', label: 'C', text: 'Planet' },
          { id: 'opt-4', label: 'D', text: 'Astronaut' }
        ],
        answer: {
          correctOptionId: 'opt-1',
          explanation: '"Breakfast" (bữa ăn sáng) là hoạt động hàng ngày phổ biến.',
          vietnameseMeaning: 'Bữa sáng là một phần của các hoạt động quen thuộc hàng ngày.'
        },
        source: {
          provider: 'ai_draft',
          license: 'Draft-Fallback',
          provenance: 'Local Fallback Template'
        },
        qualityStatus: 'review_required',
        statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `draft-fallback-${timestamp}-2`,
        version: 1,
        grade: req.grade,
        skill: 'grammar',
        topic: req.topic || 'Grammar Practice',
        difficulty: req.difficulty || 2,
        interaction: {
          family: 'text-entry',
          subtype: 'short-answer',
          variant: 'single-input'
        },
        prompt: 'They ______ watching an exciting cartoon on TV right now.',
        answer: {
          acceptedAnswers: ['are'],
          explanation: 'Chủ ngữ "They" đi với to-be "are" trong thì hiện tại tiếp diễn (right now).',
          vietnameseMeaning: 'Họ đang xem một bộ phim hoạt hình hấp dẫn trên TV lúc này.'
        },
        source: {
          provider: 'ai_draft',
          license: 'Draft-Fallback',
          provenance: 'Local Fallback Template'
        },
        qualityStatus: 'review_required',
        statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

export const geminiQuestionGenerator = new GeminiQuestionGenerator();
