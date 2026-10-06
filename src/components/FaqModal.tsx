import React, { useState, useMemo } from 'react';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import {
  X,
  HelpCircle,
  Search,
  BookOpen,
  Sparkles,
  Bot,
  GraduationCap,
  Trophy,
  Volume2,
  VolumeX,
  ChevronDown,
  CheckCircle2,
  ThumbsUp,
  FileQuestion,
  ExternalLink,
  MessageCircle,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial?: () => void;
  onOpenErrorFeedback?: () => void;
}

interface FaqItem {
  id: string;
  category: 'bncc' | 'app' | 'ia' | 'gamificacao';
  question: string;
  badge?: string;
  isFeatured?: boolean;
  summary: string;
  fullAnswer: React.ReactNode;
  narrationText: string;
  tags: string[];
}

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  onClose,
  onOpenTutorial,
  onOpenErrorFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todas' | 'bncc' | 'app' | 'ia' | 'gamificacao'>('todas');
  const [expandedId, setExpandedId] = useState<string | null>('o-que-e-bncc'); // Start with BNCC open!
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const faqList: FaqItem[] = [
    {
      id: 'o-que-e-bncc',
      category: 'bncc',
      isFeatured: true,
      badge: '⭐ Dúvida Principal',
      question: 'O que é BNCC?',
      summary:
        'A BNCC (Base Nacional Comum Curricular) é o documento oficial que define todas as aprendizagens essenciais que todo aluno brasileiro tem o direito de aprender.',
      narrationText:
        'O que é BNCC? A Base Nacional Comum Curricular é o documento oficial normativo do Ministério da Educação que define o conjunto de aprendizagens essenciais que todos os estudantes brasileiros têm direito de aprender em cada ano escolar, da Educação Infantil ao Ensino Médio. Ela estabelece competências e habilidades específicas em todas as matérias, garantindo ensino de qualidade igual para escolas públicas e privadas.',
      fullAnswer: (
        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p>
            A <strong>BNCC (Base Nacional Comum Curricular)</strong> é o documento oficial normativo do Ministério da Educação (MEC) que define o conjunto orgânico e progressivo de <strong>aprendizagens essenciais</strong> que todos os alunos têm o direito de desenvolver ao longo da Educação Básica no Brasil (Educação Infantil, Ensino Fundamental e Ensino Médio).
          </p>

          <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-1.5">
            <span className="text-xs font-black text-indigo-900 block flex items-center gap-1.5">
              <span>🎯</span> Para que a BNCC serve?
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li><strong>Igualdade no Ensino:</strong> Garante que qualquer estudante, seja de escola pública ou particular em qualquer estado do país, aprenda os mesmos conhecimentos essenciais.</li>
              <li><strong>Competências Gerais:</strong> Desenvolve habilidades para a vida, como pensamento crítico e científico, comunicação, empatia, cultura digital e cooperação.</li>
              <li><strong>Códigos de Habilidades:</strong> Cada conteúdo possui um código oficial (como <em>EF06MA01</em> para Matemática do 6º ano) que os professores seguem no planejamento escolar.</li>
            </ul>
          </div>

          <p>
            Na <strong>Trilha do Saber</strong>, 100% das matérias, resumos, explicações da IA e questões de fixação foram estruturados seguindo rigorosamente os códigos da BNCC para a sua série escolar!
          </p>
        </div>
      ),
      tags: ['bncc', 'mec', 'o que é', 'base nacional', 'ensino', 'currículo', 'escola', 'legislação', 'habilidades'],
    },
    {
      id: 'como-app-segue-bncc',
      category: 'bncc',
      question: 'Como a Trilha do Saber é alinhada à BNCC?',
      summary:
        'Todas as trilhas de estudo, cadernos de resumos e questões do app foram mapeados com os conteúdos curriculares exigidos para o seu ano escolar.',
      narrationText:
        'Todas as trilhas de estudo, resumos e questões da Trilha do Saber são organizados de acordo com os códigos da BNCC da sua série escolar. Assim, quando você estuda aqui, está revisando exatamente o que é ensinado em sala de aula e o que vai cair nas suas provas!',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            Nosso time pedagógico organizou todas as disciplinas (Matemática, Língua Portuguesa, Ciências, História, Geografia, Inglês e Artes) divididas do <strong>1º ao 9º Ano do Ensino Fundamental</strong> e do <strong>1º ao 3º Ano do Ensino Médio</strong>.
          </p>
          <p>
            Isso significa que você não perde tempo estudando assuntos fora do seu nível: você revisa exatamente o que seu professor está explicando na sala de aula e os temas que são cobrados em provas bimestrais, no SAEB e no ENEM.
          </p>
        </div>
      ),
      tags: ['bncc', 'alinhamento', 'série', 'ano', 'disciplinas', 'conteúdo', 'currículo'],
    },
    {
      id: 'explicacao-voz-ia-passa-sozinho',
      category: 'ia',
      badge: '✨ Novidade no App',
      question: 'Como funciona a explicação do app com a voz da IA que passa sozinho?',
      summary:
        'A IA agora lê a explicação do app na velocidade normal (1.0x) e avança automaticamente para o próximo passo assim que termina de falar.',
      narrationText:
        'Ao abrir a Explicação do App, a inteligência artificial começa a falar na velocidade normal de 1.0x. Conforme ela conclui cada etapa, ela passa sozinha para o próximo passo, permitindo que você aprenda como o aplicativo funciona de maneira confortável e automática sem precisar ficar tocando na tela!',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            No tour explicativo do aplicativo, ativamos o <strong>avanço automático guiado por voz</strong>:
          </p>
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] space-y-1">
            <p><strong>1. Leitura na Velocidade Normal (1.0x):</strong> A IA pronuncia cada palavra com ritmo natural, dicção clara e sem correria.</p>
            <p><strong>2. Passa sozinho as coisas:</strong> Assim que a IA conclui a leitura de uma etapa, ela aguarda um breve instante para você assimilar e muda automaticamente para a próxima tela!</p>
            <p><strong>3. Controle Total:</strong> Você pode pausar o áudio, voltar a qualquer momento ou desativar o avanço automático se preferir ler no seu próprio tempo.</p>
          </div>
        </div>
      ),
      tags: ['ia', 'voz', 'passa sozinho', 'velocidade normal', 'explicação', 'tutorial', 'áudio', 'narração'],
    },
    {
      id: 'velocidade-voz-normal',
      category: 'ia',
      question: 'A voz da IA está na velocidade normal? Posso alterar a velocidade?',
      summary:
        'Sim! A velocidade padrão da IA é agora 1.0x (normal). Você pode escolher entre lenta (0.8x), normal (1.0x) ou rápida (1.2x) nas Configurações.',
      narrationText:
        'Sim! A velocidade padrão da inteligência artificial foi ajustada para a velocidade normal de 1.0x. Se preferir ouvir mais devagar ou mais rápido, você pode personalizar a velocidade nas Configurações do aplicativo a qualquer instante.',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            Sim! A velocidade padrão de síntese de voz de todo o aplicativo foi padronizada na <strong>velocidade normal (1.0x)</strong> para garantir máxima clareza, especialmente em matérias com fórmulas matemáticas e regras gramaticais.
          </p>
          <p>
            Para alterar a velocidade da voz, toque no ícone de <strong>Configurações (engrenagem)</strong> no topo do seu Perfil e selecione entre:
          </p>
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">🐢 Lenta (0.8x)</span>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200">✨ Normal (1.0x) [Padrão]</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">⚡ Rápida (1.2x)</span>
          </div>
        </div>
      ),
      tags: ['velocidade', 'normal', 'voz', 'ia', 'configurações', 'áudio', 'falar', 'leitura'],
    },
    {
      id: 'como-funciona-a-jornada',
      category: 'app',
      question: 'Como funciona a Jornada de Aprendizado com Teoria antes das Questões?',
      summary:
        'Cada aula traz um resumo teórico detalhado com áudio da IA e exemplos resolvidos antes de liberar os 10 exercícios práticos.',
      narrationText:
        'Na Jornada de Aprendizado, você escolhe uma matéria e ouve uma explicação teórica didática com voz da IA antes de fazer os exercícios. Assim você aprende o conceito primeiro com exemplos práticos e depois responde às dez questões para fixar o aprendizado.',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            Nosso método de ensino segue três passos fundamentais:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-[11px]">
            <li><strong>Teoria em Texto e Áudio:</strong> O explicador IA resume o conceito com linguagem simples, regras e dicas práticas.</li>
            <li><strong>Exemplo Resolvido:</strong> Demonstração passo a passo de como resolver problemas desse assunto na vida real e em provas.</li>
            <li><strong>Fixação com 10 Questões:</strong> Você treina com gabarito imediato e ganha pontos de experiência (XP) a cada acerto!</li>
          </ol>
        </div>
      ),
      tags: ['jornada', 'aulas', 'teoria', 'questões', 'exercícios', 'aprendizado', 'fixação'],
    },
    {
      id: 'criador-de-provas-por-foto',
      category: 'ia',
      question: 'Como funciona o Criador de Provas por Foto com IA?',
      summary:
        'Basta fotografar a página da sua apostila ou caderno para a IA gerar automaticamente uma avaliação completa com gabarito e estimativa de nota.',
      narrationText:
        'No Criador de Provas por Foto, você fotografa qualquer página do seu livro, caderno ou apostila. A inteligência artificial lê o texto da foto e cria uma prova completa personalizada com questões de múltipla escolha e discursivas para você testar seus conhecimentos!',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            O <strong>Criador de Provas por Foto</strong> é ideal para quando você tem prova na escola na semana seguinte:
          </p>
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] space-y-1">
            <p>📸 <strong>1. Tire uma foto</strong> nítida da folha do caderno, apostila ou resumo do professor.</p>
            <p>🤖 <strong>2. A IA analisa o conteúdo</strong> e detecta automaticamente a disciplina e os tópicos principais.</p>
            <p>📝 <strong>3. Prova gerada:</strong> O app cria um simulado completo (múltipla escolha, V/F ou perguntas abertas) com correção instantânea e nota oficial estimada.</p>
          </div>
        </div>
      ),
      tags: ['foto', 'câmera', 'prova', 'simulado', 'criar prova', 'ia', 'caderno', 'livro'],
    },
    {
      id: 'caderno-digital-resumos',
      category: 'app',
      question: 'O que é o Caderno Digital de Resumos?',
      summary:
        'É uma biblioteca organizada com fichas de estudo, fórmulas matemáticas, regras e conceitos essenciais da sua série prontos para revisão.',
      narrationText:
        'O Caderno Digital é sua central de resumos escolares. Ele guarda definições, fórmulas, dicas de como resolver e regras práticas de todas as matérias para você consultar antes das provas da escola.',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            O <strong>Caderno Digital</strong> funciona como uma apostila inteligente sempre no seu bolso. Você encontra resumos estruturados por disciplina:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>Definições claras de cada termo importante.</li>
            <li>Fórmulas matemáticas com legenda de cada variável.</li>
            <li>Regras gramaticais e exemplos práticos.</li>
            <li>Opção de salvar anotações pessoais em cada matéria.</li>
          </ul>
        </div>
      ),
      tags: ['caderno', 'resumos', 'fórmulas', 'revisão', 'fichas', 'conteúdo', 'apostila'],
    },
    {
      id: 'pontos-xp-trofeus-boletim',
      category: 'gamificacao',
      question: 'Como funcionam os Pontos XP, Ofensiva Diária e o Boletim?',
      summary:
        'Cada exercício certo soma pontos XP. Manter dias consecutivos aumenta sua ofensiva e desbloqueia troféus e notas estimadas no seu Boletim.',
      narrationText:
        'A cada aula e exercício correto, você ganha pontos XP para subir de nível acadêmico. Estudar todo dia mantém sua ofensiva diária e desbloqueia insígnias e troféus especiais no seu Boletim Escolar com estimativa de notas de zero a dez.',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            A Trilha do Saber utiliza <strong>gamificação pedagógica</strong> para tornar a rotina de estudos motivadora:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <strong className="text-amber-800 block">⭐ Pontos XP & Níveis</strong>
              Avance do nível 1 (Estudante Iniciante) até o nível 10 (Mestre do Conhecimento).
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <strong className="text-orange-800 block">🔥 Ofensiva Diária</strong>
              Estude alguns minutos todos os dias para acumular dias seguidos de dedicação.
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <strong className="text-blue-800 block">📊 Boletim com Notas (0 a 10)</strong>
              Veja sua média estimada em cada disciplina calculada com base no seu desempenho.
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <strong className="text-purple-800 block">🏆 Galeria de Troféus</strong>
              Conquiste medalhas especiais ao acertar sequências de questões e desafios.
            </div>
          </div>
        </div>
      ),
      tags: ['xp', 'pontos', 'ofensiva', 'streak', 'troféus', 'boletim', 'notas', 'níveis', 'gamificação'],
    },
    {
      id: 'materias-escola-biologia-fisica-quimica',
      category: 'app',
      question: 'Minha escola divide Ciências em Biologia, Física e Química. Como ativar?',
      summary:
        'Você pode personalizar as matérias escolares no seu Perfil ou Configurações adicionando Biologia, Física e Química separadamente.',
      narrationText:
        'Se sua escola tem matérias de Biologia, Física e Química separadas, você pode entrar no seu Perfil ou Configurações e tocar em Matérias da Minha Escola para ativá-las individualmente com suas próprias trilhas de conteúdo.',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            Muitas escolas particulares ou anos avançados dividem a disciplina de Ciências da Natureza em três matérias distintas: <strong>Biologia, Física e Química</strong>.
          </p>
          <p>
            Para ativá-las:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-[11px]">
            <li>Acesse a aba <strong>Perfil</strong> no menu inferior.</li>
            <li>Toque em <strong>Matérias da Minha Escola</strong>.</li>
            <li>Marque Biologia, Física e/ou Química e salve.</li>
          </ol>
          <p className="text-[11px] text-slate-500">
            As três novas matérias aparecerão imediatamente na sua Jornada e no seu Boletim com trilhas próprias!
          </p>
        </div>
      ),
      tags: ['matérias', 'ciências', 'biologia', 'física', 'química', 'escola', 'personalizar'],
    },
    {
      id: 'funciona-offline',
      category: 'app',
      question: 'Posso usar o aplicativo sem internet (Modo Offline)?',
      summary:
        'Sim! Como o Trilha do Saber é um PWA moderno, você pode instalá-lo no celular ou computador e consultar resumos mesmo sem sinal.',
      narrationText:
        'Sim! O aplicativo Trilha do Saber funciona como um aplicativo progressivo para celular ou computador. Você pode instalar o atalho na tela inicial e acessar conteúdos do Caderno Digital mesmo quando estiver sem internet.',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            Sim! A Trilha do Saber é desenvolvida com tecnologia <strong>Progressive Web App (PWA)</strong> e armazenamento local.
          </p>
          <p>
            Você pode tocar no botão <strong>Instalar App</strong> no topo da tela para fixar o ícone oficial na tela inicial do seu celular Android, iPhone ou computador. As matérias salvas ficam acessíveis mesmo em modo avião ou quando a franquia de dados terminar.
          </p>
        </div>
      ),
      tags: ['offline', 'internet', 'sem internet', 'pwa', 'instalar', 'celular', 'aplicativo'],
    },
    {
      id: 'jogos-duelos-xadrez',
      category: 'gamificacao',
      question: 'Quais jogos educativos estão disponíveis na Trilha do Saber?',
      summary:
        'Caça-Palavras, Academia de Xadrez com regras de peças, Treino da Tabuada do 1 ao 10, Jogo da Memória, Quebra-Cabeça e Duelo 1v1 para 2 jogadores.',
      narrationText:
        'Na aba Explorar você encontra a Academia de Xadrez com guia das peças, Caça-Palavras dinâmico, Jogo da Memória, Treino da Tabuada, Quebra-Cabeça Deslizante e o Duelo do Conhecimento para dois jogadores disputarem no mesmo aparelho!',
      fullAnswer: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            A aba <strong>Explorar</strong> conta com uma central de raciocínio lógico e diversão:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <strong className="block text-slate-900">♟️ Academia de Xadrez</strong>
              Aprenda como cada peça se move (Peão, Cavalo, Bispo, Torre, Rainha e Rei).
            </div>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <strong className="block text-slate-900">⚔️ Duelo do Conhecimento 1v1</strong>
              Desafie um colega no mesmo celular para ver quem acerta mais perguntas.
            </div>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <strong className="block text-slate-900">🔍 Caça-Palavras</strong>
              Encontre termos de ciências, história e geografia riscando a tela.
            </div>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <strong className="block text-slate-900">🔢 Treino da Tabuada</strong>
              Fixe as tabuadas de multiplicação do 1 ao 10 com cronômetro.
            </div>
          </div>
        </div>
      ),
      tags: ['jogos', 'xadrez', 'duelo', 'tabuada', 'caça-palavras', 'memória', 'raciocínio'],
    },
  ];

  // Filter questions based on search query and category
  const filteredFaqs = useMemo(() => {
    return faqList.filter((item) => {
      const matchCategory = selectedCategory === 'todas' || item.category === selectedCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.question.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchSummary || matchTags;
    });
  }, [faqList, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleToggleExpand = (id: string) => {
    soundEffects.playClick();
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleSpeakAnswer = (item: FaqItem) => {
    soundEffects.playClick();
    if (speakingId === item.id) {
      speechNarrator.stop();
      setSpeakingId(null);
    } else {
      speechNarrator.stop();
      setSpeakingId(item.id);
      speechNarrator.speak(
        item.narrationText,
        () => setSpeakingId(item.id),
        () => setSpeakingId(null),
        undefined,
        1.0 // Normal speed
      );
    }
  };

  const handleVoteHelpful = (id: string, isHelpful: boolean) => {
    soundEffects.playCorrect();
    setHelpfulVotes((prev) => ({ ...prev, [id]: isHelpful }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Perguntas Frequentes (FAQ)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                  BNCC & App
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tire suas dúvidas sobre a BNCC, uso da IA e funcionalidades do app
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              speechNarrator.stop();
              setSpeakingId(null);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fechar FAQ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pergunta... (ex: O que é BNCC?, velocidade, nota, prova)"
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: 'todas', label: 'Todas as Dúvidas' },
              { id: 'bncc', label: '📘 Sobre a BNCC' },
              { id: 'ia', label: '🤖 Voz da IA & Provas' },
              { id: 'app', label: '📱 Como Usar o App' },
              { id: 'gamificacao', label: '🏆 Notas, XP & Jogos' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-white scrollbar-thin">
          {/* Quick Explanation Banner */}
          {onOpenTutorial && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">🎙️</span>
                <div>
                  <h4 className="text-xs font-black text-indigo-950">
                    Quer ver a explicação do app passo a passo?
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    A IA vai falando na velocidade normal e passa as telas sozinha!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  speechNarrator.stop();
                  setSpeakingId(null);
                  onClose();
                  onOpenTutorial();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shrink-0 transition shadow-xs active:scale-95 cursor-pointer"
              >
                Ver Explicação
              </button>
            </div>
          )}

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <h3 className="text-sm font-bold text-slate-700">Nenhuma pergunta encontrada</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Não encontramos resultados para &quot;{searchQuery}&quot;. Tente buscar por outros termos como &quot;BNCC&quot;, &quot;prova&quot; ou &quot;áudio&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todas');
                }}
                className="text-xs font-bold text-indigo-600 hover:underline pt-1"
              >
                Ver todas as perguntas
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isExpanded = expandedId === item.id;
              const isSpeaking = speakingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    item.isFeatured
                      ? 'border-indigo-300 bg-indigo-50/20 shadow-xs'
                      : isExpanded
                      ? 'border-indigo-300 bg-slate-50/70 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Question Header Bar */}
                  <div
                    onClick={() => handleToggleExpand(item.id)}
                    className="p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                        {item.category === 'bncc' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            BNCC Oficial
                          </span>
                        )}
                        {item.category === 'ia' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            IA & Voz
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {item.question}
                      </h3>

                      {!isExpanded && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      {/* Audio Button for Question */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeakAnswer(item);
                        }}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isSpeaking
                            ? 'bg-rose-100 text-rose-700 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title={isSpeaking ? 'Pausar áudio da resposta' : 'Ouvir resposta com voz da IA (1.0x)'}
                        aria-label="Ouvir resposta"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                      </button>

                      <div className={`p-1 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Answer Content */}
                  {isExpanded && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-1 border-t border-slate-100/80 space-y-3 animate-in fade-in duration-150">
                      {/* Audio playback banner when speaking */}
                      {isSpeaking && (
                        <div className="p-2.5 rounded-xl bg-indigo-100/70 border border-indigo-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                            <span className="text-[11px] font-bold text-indigo-950">
                              A IA está narrando esta resposta na velocidade normal (1.0x)...
                            </span>
                          </div>
                          <button
                            onClick={() => handleSpeakAnswer(item)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                          >
                            Pausar
                          </button>
                        </div>
                      )}

                      {/* Full Answer Content */}
                      <div className="pt-1">{item.fullAnswer}</div>

                      {/* Helpful Vote & Action Bar */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span>Esta resposta ajudou?</span>
                          <button
                            onClick={() => handleVoteHelpful(item.id, true)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                              helpfulVotes[item.id] === true
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                                : 'hover:bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                            title="Sim, foi útil"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Sim</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleSpeakAnswer(item)}
                          className="flex items-center gap-1 text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isSpeaking ? 'Pausar áudio' : 'Ouvir resposta'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with support button */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 truncate">
            <span>Dúvidas pedagógicas ou técnicas?</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenErrorFeedback && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  speechNarrator.stop();
                  setSpeakingId(null);
                  onClose();
                  onOpenErrorFeedback();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Enviar Dúvida</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEffects.playClick();
                speechNarrator.stop();
                setSpeakingId(null);
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
