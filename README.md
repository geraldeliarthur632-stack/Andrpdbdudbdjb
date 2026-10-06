# 📚 Trilha do Saber — Plataforma Educacional 100% Web

> **Plataforma Educacional Completa, Interativa e Gamificada alinhada à BNCC**  
> *"Aprenda. Pratique. Evolua — Diretamente pelo Navegador em Qualquer Dispositivo."*

O **Trilha do Saber** é uma aplicação web moderna, responsiva e estável, desenvolvida com **React 19, TypeScript, Vite 6 e Tailwind CSS v4**. Foi arquitetada para funcionar como um site completo e como **Progressive Web App (PWA)**, acessível diretamente pelo navegador em smartphones (Android e iPhone/iOS), tablets e computadores, sem necessidade de download em lojas de aplicativos ou dependência de ferramentas nativas como Android Studio, Gradle ou arquivos APK.

O projeto foi preparado e otimizado para **publicação estática direta no GitHub Pages**, suportando URLs de subpasta (ex: `https://usuario.github.io/nome-do-repositorio/`) através de caminhos relativos portáteis (`base: './'`), proteção contra 404 em rotas com `404.html` e desativação do Jekyll com `.nojekyll`.

---

## 🌟 1. Principais Recursos Educacionais

Todas as funcionalidades pedagógicas e interativas estão preservadas e funcionam nativamente no navegador:

- 🗺️ **Jornada de Aprendizagem BNCC**: Trilhas organizadas por matéria (Matemática, Português, Ciências, História, Geografia, etc.) do 1º ao 9º ano e Ensino Médio.
- 📝 **Simulados & Exercícios**: Questões com correção imediata, explicações pedagógicas, cálculo de acertos e recompensas de XP.
- 📸 **Criador de Provas por Foto**: Leitura de imagens com câmera ou upload de arquivo (`<input type="file">`), correção de gabarito e estimativa de nota.
- 🤖 **Professor & Tutor IA**: Explicações didáticas, tira-dúvidas passo a passo e tradutor de idiomas com pronúncia por voz (Web Speech API) e fallbacks locais inteligentes para funcionamento 100% offline ou estático.
- 📄 **Caderno Digital de Resumos em PDF**: Visualização e download de resumos e fichas de estudo formatadas para impressão usando `jspdf`.
- ♟️ **Xadrez Escolar Completo**: Tabuleiro interativo (`chess.js`), partidas contra IA (diferentes níveis), desafios táticos e aulas em vídeo com áudio em segundo plano (MediaSession API).
- 🎮 **Jogos Educativos & Desafios**: Caça-palavras, quiz rápido, jogo da memória e tabuada interativa.
- 🏆 **Gamificação & Conquistas**: Ofensiva diária de estudos (streak), medalhas desbloqueáveis, níveis de experiência (XP) e efeitos visuais com confetes (`canvas-confetti`).
- 🎨 **Aparência de Aplicativo Moderno**: Suporte a modo claro (Light) e modo escuro (Dark), navegação adaptativa para toque no celular e teclado/mouse no desktop.
- 📱 **Instalação como PWA**: Ícones em alta resolução, manifesto web (`manifest.json`) e Service Worker (`sw.js`) para carregamento instantâneo e offline.

---

## ⚙️ 2. Arquitetura 100% Web (Livre de Dependências Android)

O projeto é puramente web e **não depende de**:
- ❌ Android Studio / IntelliJ IDEA
- ❌ Gradle / Maven
- ❌ APK / AAB
- ❌ AndroidManifest.xml
- ❌ Kotlin / Java Android
- ❌ Activities, Fragments ou permissões nativas de dispositivo

### Como as funções funcionam no navegador:
| Recurso | Solução Web Adotada |
| :--- | :--- |
| **Persistência de Dados** | `localStorage` resiliente + sincronização opcional com Firebase Firestore |
| **Áudio e Efeitos Sonoros** | Síntese de som com **Web Audio API** (sem bloqueio de autoplay) |
| **Voz e Pronúncia** | **Web Speech API** nativa dos navegadores |
| **Upload de Fotos e Provas** | Entrada padrão HTML5 (`<input type="file" accept="image/*">`) e arrastar-e-soltar |
| **Geração de Documentos** | Biblioteca `jspdf` para compilar e baixar PDFs no próprio navegador |
| **Modo Offline & Cache** | **Service Worker** (`public/sw.js`) com cache inteligente e URLs relativas |
| **Compatibilidade de Telas** | Layout totalmente fluido em Tailwind CSS para celular, tablet e desktop |

---

## 💻 3. Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js**: Versão 18, 20 ou superior
- **npm** (ou yarn/pnpm)

### Passo a Passo:
```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/trilha-do-saber.git
cd trilha-do-saber

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento local
npm run dev
```

Abra o seu navegador no endereço: **`http://localhost:3000`**

---

## 📦 4. Como Gerar a Versão Web Final (Build Estático)

Para gerar os arquivos estáticos otimizados prontos para publicação em qualquer servidor web ou GitHub Pages:

```bash
npm run build:pages
```

Os arquivos compilados estarão na pasta **`dist/`**. Esta pasta é 100% estática (`index.html`, `404.html`, `manifest.json`, `sw.js`, assets JavaScript e CSS) e pode ser hospedada em qualquer lugar.

*(O comando alternativo `npm run build` também gera o build web junto ao bundle do servidor Node opcional).*

---

## 🚀 5. Publicação no GitHub Pages Passo a Passo

O projeto já inclui toda a infraestrutura necessária para o GitHub Pages:
- `base: './'` no `vite.config.ts` (permite rodar em subpastas de repositórios do GitHub);
- `public/.nojekyll` (impede o GitHub de ignorar arquivos estáticos essenciais);
- `public/404.html` (permite que o recarregamento de páginas funcione no navegador sem erro de página não encontrada);
- `.github/workflows/deploy.yml` (automação completa via GitHub Actions).

### Método 1: Publicação Automática via GitHub Actions (Recomendado)

1. Envie o código do projeto para o seu repositório no GitHub:
   ```bash
   git add .
   git commit -m "feat: preparar Trilha do Saber para GitHub Pages"
   git push origin main
   ```
2. No seu repositório no GitHub, acesse a aba **Settings** (Configurações).
3. No menu lateral esquerdo, clique em **Pages**.
4. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
5. O fluxo de automação configurado em `.github/workflows/deploy.yml` será iniciado automaticamente a cada `git push` na branch principal.
6. Em cerca de 1 a 2 minutos, o GitHub Pages fornecerá o link do seu site no topo da página:
   `https://seu-usuario.github.io/trilha-do-saber/`

---

### Método 2: Publicação Manual via Branch `gh-pages`

Se preferir publicar gerando o build manualmente na sua máquina:

1. Gere a pasta `dist/`:
   ```bash
   npm run build:pages
   ```
2. Instale o utilitário `gh-pages` como dependência de desenvolvimento (se desejar):
   ```bash
   npm install --save-dev gh-pages
   ```
3. Adicione o script `"deploy": "gh-pages -d dist"` no seu `package.json`.
4. Execute o deploy:
   ```bash
   npm run deploy
   ```
5. No GitHub, em **Settings** > **Pages**, configure a branch de publicação como `gh-pages` e pasta `/ (root)`.

---

## 📱 6. Como Acessar e Instalar no Celular

O Trilha do Saber se adapta com facilidade a qualquer formato de tela:

### No Android (Google Chrome):
1. Acesse o link do site publicado pelo navegador.
2. Toque nos três pontinhos no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. O ícone da Trilha do Saber aparecerá junto aos seus aplicativos, abrindo em tela cheia sem barra de endereço.

### No iPhone / iPad (Safari):
1. Acesse o site pelo navegador **Safari**.
2. Toque no botão de **Compartilhar** (quadrado com uma seta para cima na barra inferior).
3. Role as opções e selecione **"Adicionar à Tela de Início"**.
4. Toque em **"Adicionar"** no canto superior direito.

---

## 📂 7. Estrutura Limpa de Pastas

```text
/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automação de deploy para GitHub Pages
├── public/                       # Arquivos estáticos públicos
│   ├── .nojekyll                 # Desativa Jekyll no GitHub Pages
│   ├── 404.html                  # Fallback SPA para navegação no GitHub Pages
│   ├── app-logo.png              # Logotipo em alta definição
│   ├── icon.svg                  # Ícone vetorial da aplicação
│   ├── manifest.json             # Manifesto PWA com URLs relativas
│   ├── sw.js                     # Service Worker para cache e offline
│   └── firebase-messaging-sw.js  # Service Worker para notificações FCM
├── src/
│   ├── components/               # Telas e componentes interativos (Modais, Header, Navegação)
│   │   └── modes/                # Modos de estudo (Jornada, Simulado, Provas por Foto, Xadrez, etc.)
│   ├── data/                     # Dados curriculares BNCC, questões e lições de xadrez
│   ├── hooks/                    # Custom Hooks React
│   ├── services/                 # Serviços desacoplados (Áudio, IA, Notificações, PWA)
│   ├── types/                    # Tipagens TypeScript completas
│   ├── App.tsx                   # Componente central da aplicação
│   ├── main.tsx                  # Ponto de entrada React 19
│   └── index.css                 # Estilos globais Tailwind CSS v4
├── index.html                    # Ponto de entrada HTML com metadados responsivos e PWA
├── package.json                  # Dependências e scripts de execução/build
├── tsconfig.json                 # Configurações do TypeScript
├── vite.config.ts                # Configuração do Vite com base: './'
└── README.md                     # Documentação oficial do projeto
```

---

**Trilha do Saber** — Educação transformadora, acessível a qualquer momento e em qualquer dispositivo! 🎓✨
