
import { UserProfile } from './types';

const STORAGE_KEY = 'gui_a_digital_v7';

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const getProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.name) {
        // Migra perfis antigos que não tinham turma/registeredAt
        if (!parsed.turma) parsed.turma = '';
        if (!parsed.registeredAt) parsed.registeredAt = new Date().toISOString();
        return parsed as UserProfile;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar perfil:", e);
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
};
