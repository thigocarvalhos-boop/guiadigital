
import { UserProfile } from './types';

/**
 * Gera um ID único usando crypto.randomUUID quando disponível,
 * com fallback seguro para navegadores mais antigos.
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Sanitiza texto de entrada do usuário removendo caracteres de controle
 * e limitando o tamanho. React já escapa HTML no JSX, mas isto previne
 * caracteres invisíveis e conteúdo excessivamente longo.
 */
export const sanitizeText = (input: string, maxLength = 5000): string => {
  // Remove caracteres de controle (exceto newline e tab)
  // eslint-disable-next-line no-control-regex
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength);
};

/**
 * Exporta o dossiê do usuário como arquivo JSON para download.
 */
export const exportDossier = (user: UserProfile): void => {
  const exportData = {
    name: user.name,
    exportDate: new Date().toISOString(),
    matrix: user.matrix,
    dossier: user.dossier,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dossie-${user.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
