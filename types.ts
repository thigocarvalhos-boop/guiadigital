
export type Competency = 'Estrategia' | 'Escrita' | 'Analise' | 'Tecnica' | 'Design' | 'Audiovisual';

export type LessonState = 'THEORY' | 'QUIZ' | 'PRACTICE' | 'SUBMISSION' | 'REVIEW';

export interface MasteryMatrix {
  Estrategia: number;
  Escrita: number;
  Analise: number;
  Tecnica: number;
  Design: number;
  Audiovisual: number;
}

export interface Rubric {
  execucao_pratica: number;
  qualidade_tecnica: number;
  estrategia_clareza: number;
  profissionalismo: number;
}

export interface AuditResult {
  score: number;
  feedback: string;
  mentor: string;
  rubrica?: Rubric;
  aprovado: boolean;
}

/**
 * Interface representing a professional opportunity for matching
 */
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  matchingScore?: number;
}

export interface PortfolioItem {
  lessonId: string;
  lessonTitle: string;
  trackId: string;
  writtenResponse: string;
  deliveryEvidence: {
    objetivo: string;
    metodo: string;
    entregavel: string;
    resultado: string;
    autoavaliacao: string;
  };
  audit: AuditResult;
  date: string;
  versao: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  theoryContent: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
  practicePrompt: string;
  submissionPrompt: string;
  competency: Competency;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export interface UserProfile {
  name: string;
  level: number;
  exp: number;
  matrix: MasteryMatrix;
  dossier: PortfolioItem[];
  currentTrackId?: string;
}
