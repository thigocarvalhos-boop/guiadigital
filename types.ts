
export type LessonState = 'THEORY' | 'QUIZ' | 'PRACTICE' | 'REVIEW' | 'DELIVERY' | 'COMPLETED';

export type TrailId = 'social_media' | 'trafego' | 'video' | 'design';

export interface UserProfile {
  username: string;
  name: string;
  neighborhood: string;
  selectedTrail: TrailId;
  xp: number;
  portfolio: PortfolioItem[];
  joinedAt: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  score: number;
  approvedAt: number;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  theory: string;
  minReadSeconds: number;
  quiz: Quiz;
  challenge: string;
  reviewContent: string;
  minChars: number;
  xpValue: number;
}

export interface Module {
  id: string;
  trailId: TrailId;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

export interface AIReview {
  verdict: 'approved' | 'revision';
  feedback: string;
  score: number;
}

export interface Opportunity {
  id: string;
  title: string;
  businessName: string;
  description: string;
  location: string;
  matchingScore?: number;
}
