# Trilha do Saber — Projeto Android

Este diretório contém o projeto Android nativo completo para compilar e empacotar o **Trilha do Saber** (`com.trilhadosaber.estudefacil`) como aplicativo Android instalável (APK) e pacote de publicação para a Google Play Store (AAB).

---

## Estrutura do Projeto Android

- **Package Name / Application ID**: `com.trilhadosaber.estudefacil`
- **Nome do Aplicativo**: `Trilha do Saber`
- **Versão**: `1.0.0` (versionCode: `1`)
- **SDK Mínimo**: `24` (Android 7.0+)
- **SDK Alvo / Compilação**: `34` (Android 14)
- **Recursos Nativos**:
  - Acesso à câmera e galeria para o **Criador de Provas por Foto** (`PhotoExamCreatorMode`);
  - Suporte a áudio e microfone para respostas por voz;
  - Splash screen nativa com o ícone do Trilha do Saber;
  - Navegação fluida com suporte ao botão físico/gestual Voltar do Android;
  - Suporte a downloads de relatórios e resumos em PDF;
  - WebView otimizado com aceleração por hardware e armazenamento DOM persistente.

---

## Como Gerar o APK (Instalador Direto)

Para gerar o APK de depuração (para testes imediatos em qualquer celular ou emulador):

```bash
cd android
./gradlew assembleDebug
```

O arquivo gerado estará em:
`android/app/build/outputs/apk/debug/app-debug.apk`

Para gerar o APK de Release:

```bash
cd android
./gradlew assembleRelease
```

O arquivo gerado estará em:
`android/app/build/outputs/apk/release/app-release-unsigned.apk` (ou assinado se a chave estiver configurada).

---

## Como Gerar o AAB (Android App Bundle para Google Play Store)

A Google Play Store exige o formato `.aab` para publicação de novos aplicativos. Para gerar o pacote:

```bash
cd android
./gradlew bundleRelease
```

O arquivo gerado estará em:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Assinatura do Aplicativo (Release Signing)

Para assinar o APK/AAB para a Google Play, crie um arquivo de chave (*keystore*) ou utilize o fornecido pelo Google Play Console (Google Play App Signing):

```bash
keytool -genkey -v -keystore release.jks -alias trilhadosaber -keyalg RSA -keysize 2048 -validity 10000
```

Defina as variáveis de ambiente ou passe como parâmetros do Gradle:

```bash
export KEYSTORE_FILE="/caminho/para/release.jks"
export KEYSTORE_PASSWORD="sua_senha_keystore"
export KEY_ALIAS="trilhadosaber"
export KEY_PASSWORD="sua_senha_alias"

./gradlew bundleRelease
```

---

## Configuração do Firebase para Android (Google Play & Auth)

Para garantir que o Login com Google e o Firestore funcionem 100% no Android:

1. No Console do Firebase (projeto `gen-lang-client-0961211045`), acesse **Configurações do Projeto** > **Seus aplicativos** > **Adicionar aplicativo Android**.
2. **Nome do pacote**: `com.trilhadosaber.estudefacil`.
3. **Apelido do app**: `Trilha do Saber`.
4. **Certificado de assinatura SHA-1 e SHA-256**:
   - Obtenha executando:
     ```bash
     cd android
     ./gradlew signingReport
     ```
   - Ou copie a impressão digital SHA-1 do **Play App Signing** no Google Play Console se a assinatura for gerenciada pelo Google.
5. Baixe o arquivo `google-services.json` e coloque-o na pasta `android/app/`.
