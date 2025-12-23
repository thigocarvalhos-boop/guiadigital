
export type Competency = 'Estrategia' | 'Escrita' | 'Analise' | 'Tecnica';

export interface MasteryMatrix {
  Estrategia: number;
  Escrita: number;
  Analise: number;
  Tecnica: number;
}

export interface AuditResult {
  score: number;
  feedback: string;
  mentor: string;
}

/**
 * Representa um item entregue no portfólio do usuário.
 */
export interface PortfolioItem {
  lessonId: string;
  lessonTitle: string;
  assetUrl: string;
  audit: AuditResult;
  date: string;
}

/**
 * Representa uma oportunidade de trabalho ou gig no ecossistema.
 */
export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  matchingScore?: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  theory: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
  };
  labPrompt: string;
  deliveryType: 'link' | 'media';
  competency: Competency;
}

export interface Track {
  id: string;
  title: string;
  icon: string;
  imageUrl: string;
  lessons: Lesson[];
}

export interface UserProfile {
  name: string;
  level: number;
  exp: number;
  matrix: MasteryMatrix;
  dossier: PortfolioItem[];
}
