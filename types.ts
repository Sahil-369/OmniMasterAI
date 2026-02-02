
export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  topics: string[];
}

export interface Roadmap {
  subject: string;
  goal: string;
  steps: RoadmapStep[];
}

export interface TopicDetail {
  title: string;
  content: string;
  keyPoints: string[];
  examples: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  url: string;
  source: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

export interface SavedSubject {
  id: string;
  subject: string;
  roadmap: Roadmap;
  completedTopics: string[];
  createdAt: number;
}

export type CompanionPersona = 'Teacher' | 'Friend' | 'Brother' | 'Sister' | 'Girlfriend' | 'Boyfriend';

export interface UserUsage {
  dailyTopicsCount: number;
  lastTopicReset: number;
  adUnlockedSubjects: boolean;
  adUnlockedTopicsToday: boolean;
  dailyRewardClaimed: boolean;
  streak: number;
  dailySubjectLessons: Record<string, number>;
}

export interface UserSettings {
  userName: string;
  aiVoice: 'male' | 'female';
  language: string;
  companionPersona: CompanionPersona;
  isPremium: boolean;
  premiumPlan?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  isPublicProfile: boolean;
  isPublicPaths: boolean;
}

export interface AuthUser {
  id: string;
  internalId: string;
  masterId: string;
  name: string;
  email: string;
  photoUrl?: string;
  emoji?: string;
  provider: 'google' | 'facebook' | 'guest' | 'email';
  isGuest?: boolean;
  followersCount?: number;
}

export interface LeaderboardEntry {
  masterId: string;
  name: string;
  photoUrl?: string;
  emoji?: string;
  totalMasteryPoints: number;
  subjectsCount: number;
  isCurrentUser?: boolean;
  isPublicProfile?: boolean;
  isPublicPaths?: boolean;
  isPremium?: boolean;
  publicSubjects?: { subject: string, progress: number }[];
  followersCount?: number;
}

export interface NoticeData {
  notice: string | null;
  warning: string | null;
  updates: string | null;
}

export interface AppState {
  authUser: AuthUser | null;
  currentSubjectId: string | null;
  savedSubjects: SavedSubject[];
  selectedStepId: string | null;
  selectedTopic: string | null;
  topicDetail: TopicDetail | null;
  quiz: QuizQuestion[] | null;
  isLoading: boolean;
  isNewsLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  userSettings: UserSettings;
  currentQuote: string | null;
  usage: UserUsage;
  dailyNews: NewsItem[];
  notice: NoticeData | null;
}
