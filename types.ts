
export interface UserProfile {
  username: string;
  password?: string;
  name: string;
  neighborhood: string;
  skill: string;
  age: string;
  class: string;
  rg: string;
  cpf: string;
  email: string;
  phone: string;
  level: number;
  joinedAt: number;
  status: 'pending' | 'active' | 'rejected';
  verificationCode?: string;
  isVerified: boolean;
  lgpdAccepted: boolean;
  // Novos campos de diversidade
  sexualOrientation: string;
  sexualOrientationOther?: string;
  genderIdentity: string;
  genderIdentityOther?: string;
  isIntersex: string;
  transIdentity: string;
  transIdentityOther?: string;
  socialName?: string;
  ethnicity: string;
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
  theory: string;
  challenge: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  checklist: string[];
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

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
}
