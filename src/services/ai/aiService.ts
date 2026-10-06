import { GeminiService } from './geminiService';
import type { AITutorRequest, AITutorResponse, AIMessage } from './aiTypes';
import { speechNarrator } from '../speechNarrator';

/**
 * Camada unificada de Inteligência Artificial para a Trilha do Saber
 */
export class AIService {
  /**
   * Função principal solicitada no item 71 da especificação: generateAIResponse()
   * Recebe mensagem, contexto, matéria, aula e histórico
   */
  static async generateAIResponse(
    message: string,
    options?: {
      context?: string;
      subject?: string;
      lessonTitle?: string;
      grade?: string;
      history?: Array<{ role: 'user' | 'model'; parts: string }>;
    }
  ): Promise<AITutorResponse> {
    const request: AITutorRequest = {
      message,
      context: options?.context,
      subject: options?.subject || 'Geral',
      lessonTitle: options?.lessonTitle,
      grade: options?.grade || '6_fund',
      history: options?.history,
    };

    return GeminiService.askTutor(request);
  }

  /**
   * Cria objeto formatado de mensagem para chat
   */
  static createMessage(
    sender: 'user' | 'assistant' | 'system',
    text: string,
    subject?: string,
    isError?: boolean
  ): AIMessage {
    return {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender,
      text,
      timestamp: new Date().toISOString(),
      subject,
      isError,
    };
  }

  /**
   * Síntese de voz com compatibilidade Android nativo e navegadores Web via speechNarrator
   */
  static speakText(text: string, onEnd?: () => void): boolean {
    try {
      speechNarrator.speak(text, onEnd);
      return true;
    } catch {
      onEnd?.();
      return false;
    }
  }

  /**
   * Para a reprodução de voz atual
   */
  static stopSpeaking(): void {
    speechNarrator.stop();
  }
}

export * from './aiTypes';
export * from './aiConfig';
export * from './geminiService';
