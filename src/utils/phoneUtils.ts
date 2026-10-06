/**
 * Utilitários para Formatação e Validação de Telefones com foco no Brasil (+55)
 * Converte automaticamente para o padrão internacional E.164 exigido pelo Firebase Authentication.
 */

// Lista oficial de DDDs válidos no Brasil (ANATEL)
export const VALID_BRAZILIAN_DDDS = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
]);

export interface ParsedPhoneResult {
  isValid: boolean;
  e164: string; // Ex: "+5544999999999"
  displayFormatted: string; // Ex: "+55 (44) 99999-9999"
  nationalFormatted: string; // Ex: "(44) 99999-9999"
  isBrazilian: boolean;
  errorMessage?: string;
}

/**
 * Aplica máscara visual enquanto o usuário digita no campo de telefone.
 * Aceita números com DDD brasileiro e ajusta automaticamente parênteses e traço.
 */
export function formatPhoneAsYouType(raw: string): string {
  if (!raw) return '';

  // Se o usuário explicitamente iniciou com código internacional com '+'
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (hasPlus) {
    if (digits.startsWith('55')) {
      const rest = digits.slice(2);
      return formatBrazilianDigits(rest, true);
    }
    // Outros países: formatação internacional simples com espaços
    return `+${digits.slice(0, 15)}`;
  }

  // Se começou com 55 e tem mais de 10 dígitos, é código do país
  if (digits.startsWith('55') && digits.length >= 12) {
    return formatBrazilianDigits(digits.slice(2), true);
  }

  // Remove zero à esquerda do DDD caso o usuário tenha digitado Ex: 044
  const normalizedDigits = digits.startsWith('0') && digits.length > 2 ? digits.slice(1) : digits;

  return formatBrazilianDigits(normalizedDigits, false);
}

function formatBrazilianDigits(digits: string, includeCountryCode: boolean): string {
  const prefix = includeCountryCode ? '+55 ' : '';

  if (digits.length === 0) return prefix;
  if (digits.length <= 2) return `${prefix}(${digits}`;
  if (digits.length <= 6) return `${prefix}(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    // Fixo (8 dígitos): (44) 3333-3333
    return `${prefix}(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Celular (9 dígitos): (44) 99999-9999
  return `${prefix}(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Valida o número de telefone e converte para o padrão internacional E.164.
 * Aceita números no formato:
 * - (44) 99999-9999
 * - 44999999999
 * - +55 (44) 99999-9999
 * - 044 99999-9999
 * - Números internacionais iniciados com +
 */
export function parseAndValidatePhone(raw: string): ParsedPhoneResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      isValid: false,
      e164: '',
      displayFormatted: '',
      nationalFormatted: '',
      isBrazilian: false,
      errorMessage: 'Por favor, digite seu número de telefone com DDD.',
    };
  }

  const isExplicitInternational = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');

  // Trata internacional com +
  if (isExplicitInternational) {
    if (digits.startsWith('55')) {
      digits = digits.slice(2);
    } else {
      // Outro país
      if (digits.length < 8 || digits.length > 15) {
        return {
          isValid: false,
          e164: `+${digits}`,
          displayFormatted: `+${digits}`,
          nationalFormatted: `+${digits}`,
          isBrazilian: false,
          errorMessage: 'Número internacional deve ter entre 8 e 15 dígitos.',
        };
      }
      return {
        isValid: true,
        e164: `+${digits}`,
        displayFormatted: `+${digits}`,
        nationalFormatted: `+${digits}`,
        isBrazilian: false,
      };
    }
  } else {
    // Sem +, verifica se começou com 55 (DDI Brasil)
    if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
      digits = digits.slice(2);
    }
  }

  // Remove zero à esquerda do DDD (Ex: 044 99999-9999 -> 44 99999-9999)
  if (digits.startsWith('0') && digits.length >= 11) {
    digits = digits.slice(1);
  }

  // Validação para número brasileiro (deve ter 10 dígitos para fixo ou 11 dígitos para celular)
  if (digits.length < 10) {
    return {
      isValid: false,
      e164: '',
      displayFormatted: trimmed,
      nationalFormatted: trimmed,
      isBrazilian: true,
      errorMessage: 'Número incompleto. Digite o DDD de 2 dígitos e os 8 ou 9 dígitos do telefone.',
    };
  }

  if (digits.length > 11) {
    return {
      isValid: false,
      e164: '',
      displayFormatted: trimmed,
      nationalFormatted: trimmed,
      isBrazilian: true,
      errorMessage: 'Número muito longo. O formato celular do Brasil deve conter DDD + 9 dígitos.',
    };
  }

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    return {
      isValid: false,
      e164: '',
      displayFormatted: trimmed,
      nationalFormatted: trimmed,
      isBrazilian: true,
      errorMessage: `O DDD (${ddd}) informado não é válido no Brasil. Verifique o código de área da sua região.`,
    };
  }

  // Se for celular (11 dígitos), deve começar com o dígito 9
  if (digits.length === 11 && !number.startsWith('9')) {
    return {
      isValid: false,
      e164: '',
      displayFormatted: trimmed,
      nationalFormatted: trimmed,
      isBrazilian: true,
      errorMessage: 'Celulares no Brasil devem começar com o dígito 9 após o DDD (Ex: 11 99999-8888).',
    };
  }

  // Formato E.164 oficial para o Firebase: +55 + DDD + Número (ex: +5544999999999)
  const e164 = `+55${digits}`;
  const nationalFormatted =
    digits.length === 11
      ? `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`
      : `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  const displayFormatted = `+55 ${nationalFormatted}`;

  return {
    isValid: true,
    e164,
    displayFormatted,
    nationalFormatted,
    isBrazilian: true,
  };
}
