
export type LessonState = 
  | 'LOCKED' 
  | 'THEORY' 
  | 'THEORY_COMPLETED' 
  | 'QUIZ_APPROVED' 
  | 'PRACTICE_APPROVED' 
  | 'DELIVERABLE_APPROVED' 
  | 'COMPLETED';

export interface UserProfile {
  username: string;
  name: string;
  neighborhood: string;
  level: number;
  joinedAt: number;
  xp: number;
  portfolio: PortfolioItem[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DeliverableData {
  what_i_did: string;
  how_i_did: string;
  deliverable_link: string;
  results_or_learnings: string;
  self_assessment: string;
}

export interface AIReview {
  verdict: 'approved' | 'needs_revision';
  scores: {
    execution_0_3: number;
    technical_quality_0_3: number;
    strategy_clarity_0_2: number;
    professionalism_0_2: number;
    conceptual_mastery_0_3?: number; // Para prática de texto
  };
  strengths: string[];
  weaknesses: string[];
  actionable_fixes: string[];
  min_required_rewrite_instructions?: string;
  portfolio_summary_if_approved?: string;
  evidence_check?: {
    evidence_present: boolean;
    evidence_quality: "weak" | "ok" | "strong";
    what_is_missing: string[];
  };
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  theory: string;
  challenge: string;
  deliverablePrompt: string;
  deliverableChecklist: string[];
  quizzes: QuizQuestion[];
  gradingRubric: string;
  xpValue: number;
  minWordsPractice: number;
  minReadSeconds: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  technicalSkill: string;
  lessons: Lesson[];
  xpValue: number;
}

export interface PortfolioItem {
  id: string;
  lessonTitle: string;
  category: string;
  description: string;
  artifactUrl: string;
  approvedAt: number;
  aiFeedback: string;
}

export interface LessonProgress {
  lessonId: string;
  state: LessonState;
  practiceText?: string;
  deliverableData?: DeliverableData;
  practiceReview?: AIReview;
  deliverableReview?: AIReview;
}

// Added Opportunity interface to resolve the import error in utils.ts on line 2
export interface Opportunity {
  id: string;
  title: string;
  businessName: string;
  location: string;
  requiredSkill: string;
  description: string;
  matchingScore?: number;
}
