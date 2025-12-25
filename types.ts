
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
  execucao_pratica: number; // 0-3
  qualidade_tecnica: number; // 0-3
  estrategia_clareza: number; // 0-2
  profissionalismo: number; // 0-2
}

export interface AuditResult {
  score: number;
  feedback: string;
  mentor: string;
  rubrica?: Rubric;
  aprovado: boolean;
}

export interface PortfolioItem {
  lessonId: string;
  lessonTitle: string;
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
  icon: string;
  lessons: Lesson[];
}

export interface UserProfile {
  name: string;
  level: number;
  exp: number;
  matrix: MasteryMatrix;
  dossier: PortfolioItem[];
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  matchingScore?: number;
}
