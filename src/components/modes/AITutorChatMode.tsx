import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { GRADE_LABELS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import {
  ArrowLeft,
  Send,
  Camera,
  MoreVertical,
  Trash2,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  Square,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageBase64?: string;
  mimeType?: string;
  timestamp: number;
}

interface AITutorChatModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number) => void;
}

const STORAGE_CHAT_KEY = 'estudahud_ai_tutor_chat_history_v1';

export const AITutorChatMode: React.FC<AITutorChatModeProps> = ({
  user,
  onBack,
  onEarnPoints,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'welcome-tutor-1',
        role: 'model',
        text: `Olá! Sou o seu Professor IA particular da Trilha do Saber. 🎓\n\nEstou pronto para te ajudar em qualquer matéria escolar:\n• 📜 História (revoluções, impérios, guerras, datas e causas)\n• 🌍 Geografia (biomas, relevo, clima, mapas e população)\n• 📖 Língua Portuguesa (redação, gramática, crase, concordância)\n• 🔬 Ciências / Biologia (células, ecossistemas, corpo humano)\n• 📐 Matemática (cálculos, equações, frações, geometria)\n• 🇬🇧 Inglês (vocabulário e tempos verbais)\n\nVocê também pode tirar foto do seu caderno ou apostila com a câmera 📷 para eu analisar e explicar passo a passo. O que vamos estudar agora?`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'paused'>('idle');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to speech status
  useEffect(() => {
    const unsub = speechNarrator.subscribeStatus((status) => {
      setSpeechStatus(status);
      if (status === 'idle') {
        setPlayingMsgId(null);
      }
    });
    return () => {
      unsub();
      speechNarrator.stop();
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    soundEffects.playClick();
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      imageBase64: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: user.grade,
          userName: user.name,
          message: textToSend,
          imageBase64: selectedImage || undefined,
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'model',
          text: data.text || 'Entendido! Como posso te ajudar a avançar no conteúdo?',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        onEarnPoints?.(5);
      } else {
        throw new Error('Falha na resposta do tutor');
      }
    } catch (_err) {
      const fallbackMsg: ChatMessage = {
        id: `msg_fallback_${Date.now()}`,
        role: 'model',
        text:
          'Ótima pergunta! Para resolver esse conceito passo a passo, observe a regra geral e tente substituir os valores com calma. Quer que eu detalhe mais algum termo?',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearHistory = () => {
    soundEffects.playClick();
    setMessages([
      {
        id: 'msg_welcome',
        role: 'model',
        text: `Olá, ${user.name || 'Estudante'}! 🎓 Em que posso te ajudar hoje?`,
        timestamp: Date.now(),
      },
    ]);
    setShowMenu(false);
  };

  // Render text with math formula styling
  const renderMessageContent = (text: string) => {
    // If it contains $$ math formula, format it nicely
    if (text.includes('$$')) {
      const parts = text.split('$$');
      return (
        <div className="space-y-2">
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return (
                <div
                  key={index}
                  className="my-2 p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center text-center shadow-2xs"
                >
                  <span className="font-mono text-sm font-black text-purple-700 tracking-wider">
                    {part.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)').replace(/\\pm/g, '±').replace(/\\sqrt\{([^}]+)\}/g, '√($1)')}
                  </span>
                </div>
              );
            }
            return (
              <p key={index} className="whitespace-pre-line leading-relaxed">
                {part}
              </p>
            );
          })}
        </div>
      );
    }

    return <p className="whitespace-pre-line leading-relaxed">{text}</p>;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 max-w-lg mx-auto w-full relative pb-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-20">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-sm shadow-2xs">
            🤖
          </div>
          <span className="text-sm font-black text-slate-900">Tutor IA</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 min-w-[140px]">
              <button
                onClick={handleClearHistory}
                className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs font-medium shadow-xs transition-all relative group ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {msg.imageBase64 && (
                  <img
                    src={msg.imageBase64}
                    alt="Foto enviada"
                    className="max-h-48 w-auto rounded-2xl mb-2 object-cover border border-slate-200"
                  />
                )}
                {renderMessageContent(msg.text)}

                {/* Voice narration controls for AI Tutor response */}
                {!isUser && (
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {playingMsgId === msg.id && speechStatus === 'playing' ? (
                        <>
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              speechNarrator.pause();
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-bold flex items-center gap-1 transition cursor-pointer hover:bg-amber-100"
                            title="Pausar áudio"
                          >
                            <Pause className="w-3 h-3" />
                            <span>Pausar</span>
                          </button>
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              speechNarrator.stop();
                              setPlayingMsgId(null);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-700 font-bold flex items-center gap-1 transition cursor-pointer hover:bg-rose-100"
                            title="Parar áudio"
                          >
                            <Square className="w-2.5 h-2.5" />
                            <span>Parar</span>
                          </button>
                        </>
                      ) : playingMsgId === msg.id && speechStatus === 'paused' ? (
                        <>
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              speechNarrator.resume();
                            }}
                            className="px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-[10px] text-purple-700 font-bold flex items-center gap-1 transition cursor-pointer hover:bg-purple-100"
                            title="Continuar áudio"
                          >
                            <Play className="w-3 h-3" />
                            <span>Continuar</span>
                          </button>
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              speechNarrator.stop();
                              setPlayingMsgId(null);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-700 font-bold flex items-center gap-1 transition cursor-pointer hover:bg-rose-100"
                            title="Parar áudio"
                          >
                            <Square className="w-2.5 h-2.5" />
                            <span>Parar</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            const cleanText = msg.text.replace(/\[MATH\][\s\S]*?\[\/MATH\]/g, 'Fórmula matemática');
                            setPlayingMsgId(msg.id);
                            speechNarrator.speak(
                              cleanText,
                              {
                                onStart: () => setPlayingMsgId(msg.id),
                                onEnd: () => setPlayingMsgId(null),
                              }
                            );
                          }}
                          className="text-[10px] text-slate-500 hover:text-purple-600 flex items-center gap-1 transition cursor-pointer px-1.5 py-0.5 rounded-lg hover:bg-purple-50"
                          title="Ouvir explicação em voz alta"
                        >
                          <Volume2 className="w-3 h-3 text-purple-600" />
                          <span>Ouvir explicação</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tutor IA</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-3xl rounded-bl-xs p-3.5 flex items-center gap-2 text-slate-500 text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse delay-150" />
              <span className="ml-1 text-slate-500">Tutor pensando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            'Revolução Francesa',
            'Biomas do Brasil',
            'Regras de concordância',
            'O que é fotossíntese?',
            'Como fazer Bhaskara?',
            'Dicas para redação nota 1000',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                soundEffects.playClick();
                handleSendMessage(suggestion);
              }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap shrink-0 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              💡 {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Selected Image Preview Pill */}
      {selectedImage && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Anexo"
              className="w-12 h-12 rounded-xl object-cover border border-purple-500 shadow-2xs"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-slate-600 font-semibold">Foto pronta para envio</span>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-purple-500 rounded-full px-3 py-1.5 shadow-xs">
          {/* Camera Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full transition cursor-pointer"
            title="Tirar foto do caderno ou livro"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageCapture}
          />

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite sua dúvida..."
            className="flex-1 bg-transparent text-slate-900 text-xs outline-hidden placeholder:text-slate-400 py-1"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() && !selectedImage}
            className="p-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-full transition shadow-2xs cursor-pointer"
            title="Enviar mensagem"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
