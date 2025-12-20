
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  framework?: string;
  checklist: string[];
  tips?: string[];
  xpValue: number;
}

export interface Module {
  id: string;
  title: string;
  progress: number;
  status: 'locked' | 'current' | 'completed';
  description: string;
  icon: string;
  xpValue: number;
  lessons: Lesson[];
  technicalSkill: string;
}

export interface Opportunity {
  id: string;
  businessName: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  type: 'freelance' | 'pj' | 'clt';
  reward: string;
  matchingScore?: number;
}

export interface Client {
  id: string;
  name: string;
  project: string;
  status: 'active' | 'completed' | 'waiting';
  value: string;
  progress: number;
  startDate: string;
}

export interface MarketReadiness {
  technical: number;
  persuasion: number;
  resilience: number;
  isCertified: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  impact: string;
  avatar: string;
  isUser?: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  icon: string;
}

/**
 * Added PortfolioItem interface to resolve the import error in utils.ts
 */
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
}
