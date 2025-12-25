
export type Competency = 'Estrategia' | 'Escrita' | 'Analise' | 'Tecnica' | 'Design' | 'Audiovisual';

export type LessonState = 'THEORY' | 'QUIZ' | 'PRACTICE' | 'SUBMISSION' | 'REVIEW' | 'PORTFOLIO_PREVIEW';

export type UserRole = 'ADMIN' | 'EDITOR' | 'MONITOR' | 'USER';

export interface MasteryMatrix {
  Estrategia: number;
  Escrita: number;
  Analise: number;
  Tecnica: number;
  Design: number;
  Audiovisual: number;
}

export interface AuditResult {
  score: number;
  feedback: string;
  mentor: string;
  aprovado: boolean;
}

export interface PortfolioItem {
  id: string;
  lessonId: string;
  lessonTitle: string;
  trackId: string;
  writtenResponse: string;
  evidenceImage?: string; // Base64 ou URL da imagem do trabalho
  audit: AuditResult;
  date: string;
  versao: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  theoryContent: string;
  clientBriefing?: string; // Simulação de um cliente real
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
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: number;
  exp: number;
  matrix: MasteryMatrix;
  dossier: PortfolioItem[];
  status: 'ACTIVE' | 'BLOCKED';
}
