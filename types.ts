
export interface UserProfile {
  name: string;
  neighborhood: string;
  skill: string;
  level: number;
  joinedAt: number;
}

export interface IATool {
  id: string;
  name: string;
  description: string;
  icon: string;
  minLevel: number;
  promptTemplate: string;
}

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
  requiredSkill?: string;
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

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
}
