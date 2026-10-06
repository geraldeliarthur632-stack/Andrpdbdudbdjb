import { AI_CONFIG } from './aiConfig';
import type { AITutorRequest, AITutorResponse, AITextAnalysisRequest, AITextAnalysisResponse } from './aiTypes';

export class GeminiService {
  /**
   * Envia uma mensagem para o Professor IA tutor através do backend seguro
   */
  static async askTutor(req: AITutorRequest): Promise<AITutorResponse> {
    if (!navigator.onLine) {
      return {
        answer: 'Você está sem conexão com a internet no momento. Conecte-se para que o Professor IA possa responder à sua dúvida em tempo real!',
        offlineFallback: true,
        encouragement: 'Enquanto isso, você pode continuar praticando as questões e trilhas já carregadas no aplicativo.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

      const response = await fetch(AI_CONFIG.endpoints.tutorChat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: req.message,
          subject: req.subject || 'Geral',
          context: req.context || (req.lessonTitle ? `Aula: ${req.lessonTitle}` : ''),
          grade: req.grade || '6_fund',
          history: req.history || [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro de resposta da IA (HTTP ${response.status})`);
      }

      const data = await response.json();
      return {
        answer: data.answer || data.reply || 'Excelente pergunta! Vamos analisar passo a passo.',
        subject: req.subject,
        relatedTopics: data.relatedTopics || [],
        encouragement: data.encouragement || 'Continue assim! Aprender é um processo contínuo.',
      };
    } catch (err: any) {
      console.warn('Falha no GeminiService.askTutor:', err);
      if (err.name === 'AbortError') {
        return {
          answer: 'O Professor IA demorou um pouco mais que o esperado para responder. Verifique sua conexão e tente novamente.',
          isError: true,
          offlineFallback: true,
        } as any;
      }
      return {
        answer: 'Não foi possível conectar ao Professor IA agora. Verifique se a variável GEMINI_API_KEY está configurada no ambiente ou tente novamente mais tarde.',
        isError: true,
        offlineFallback: true,
      } as any;
    }
  }

  /**
   * Analisa texto escolar: explica termos, sintetiza ou gera questões de estudo
   */
  static async analyzeText(req: AITextAnalysisRequest): Promise<AITextAnalysisResponse> {
    if (!navigator.onLine) {
      return {
        result: 'Sem conexão com a internet para análise de texto. Tente novamente quando estiver conectado.',
      };
    }

    try {
      const response = await fetch(AI_CONFIG.endpoints.explainer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: req.text.slice(0, 300),
          subject: req.subject || 'Português',
          mode: req.action,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar texto com a IA');
      }

      const data = await response.json();
      return {
        result: data.explanation || data.summary || data.result || 'Análise concluída com sucesso.',
        keyPoints: data.keyPoints || [],
      };
    } catch (err: any) {
      return {
        result: 'Não foi possível analisar o texto agora. Verifique a conexão com a internet.',
      };
    }
  }
}
