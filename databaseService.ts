
import { SavedSubject, AuthUser, UserSettings, UserUsage, ChatMessage } from '../types';
import { supabaseService } from './supabaseService';

const KEYS = {
  AUTH: 'omnimaster_auth',
  SETTINGS: 'omnimaster_settings',
  SUBJECTS_PREFIX: 'omnimaster_subjects_',
  USAGE: 'omnimaster_usage',
  CHAT_PREFIX: 'omnimaster_chat_history_'
};

const DEFAULT_USAGE: UserUsage = {
  dailyTopicsCount: 0,
  lastTopicReset: Date.now(),
  adUnlockedSubjects: false,
  adUnlockedTopicsToday: false,
  dailyRewardClaimed: false,
  streak: 0,
  dailySubjectLessons: {}
};

export const databaseService = {
  saveUser: (user: AuthUser) => {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
  },
  
  getUser: (): AuthUser | null => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },

  clearAuth: () => {
    localStorage.removeItem(KEYS.AUTH);
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSettings: (): UserSettings | null => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  getUsage: (): UserUsage => {
    const data = localStorage.getItem(KEYS.USAGE);
    let usage: UserUsage = data ? JSON.parse(data) : { ...DEFAULT_USAGE };
    
    if (!usage.dailySubjectLessons) usage.dailySubjectLessons = {};

    const lastDate = new Date(usage.lastTopicReset);
    const today = new Date();
    
    const lastDateMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (todayMidnight > lastDateMidnight) {
      const resetUsage: UserUsage = {
        ...usage,
        dailyTopicsCount: 0,
        lastTopicReset: Date.now(),
        adUnlockedTopicsToday: false,
        dailyRewardClaimed: false,
        dailySubjectLessons: {}, 
        streak: (todayMidnight - lastDateMidnight > oneDayInMs) ? 0 : usage.streak
      };
      localStorage.setItem(KEYS.USAGE, JSON.stringify(resetUsage));
      return resetUsage;
    }
    
    return usage;
  },

  saveUsage: (usage: UserUsage) => {
    localStorage.setItem(KEYS.USAGE, JSON.stringify(usage));
  },

  incrementUsage: (subjectId: string): UserUsage => {
    const usage = databaseService.getUsage();
    const updatedUsage = {
      ...usage,
      dailyTopicsCount: (usage.dailyTopicsCount || 0) + 1,
      dailySubjectLessons: {
        ...usage.dailySubjectLessons,
        [subjectId]: (usage.dailySubjectLessons?.[subjectId] || 0) + 1
      }
    };
    databaseService.saveUsage(updatedUsage);
    return updatedUsage;
  },

  saveSubjects: (userId: string, subjects: SavedSubject[]) => {
    localStorage.setItem(`${KEYS.SUBJECTS_PREFIX}${userId}`, JSON.stringify(subjects));
  },

  getSubjects: (userId: string): SavedSubject[] => {
    const data = localStorage.getItem(`${KEYS.SUBJECTS_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveChatHistory: (userId: string, messages: ChatMessage[]) => {
    const trimmed = messages.slice(-50); // Keep buffer healthy
    localStorage.setItem(`${KEYS.CHAT_PREFIX}${userId}`, JSON.stringify(trimmed));
  },

  getChatHistory: (userId: string): ChatMessage[] => {
    const data = localStorage.getItem(`${KEYS.CHAT_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  },

  syncToCloud: async (userId: string, state: { subjects: SavedSubject[], settings: UserSettings, usage: UserUsage }) => {
    try {
      if (!userId || !state) return false;
      const subjects = state.subjects || [];
      const settings = state.settings || {} as UserSettings;
      const usage = state.usage || {} as UserUsage;
      const points = databaseService.calculateMasteryPoints(subjects);
      
      await supabaseService.updateProfile(userId, { 
        masterypoints: points,
        daysstreak: usage.streak || 0,
        premium: settings.isPremium || false,
        name: settings.userName || 'Learner'
      });

      const payload = { subjects, settings, usage, syncedAt: Date.now() };
      const { error } = await supabaseService.logChat(userId, payload, settings);
      return !error;
    } catch (e) {
      console.error("[CloudSync] Sync Error:", e);
      return false;
    }
  },

  recoverFromCloud: async (userId: string) => {
    try {
      const state = await supabaseService.getLatestSyncedState(userId);
      if (state && state.subjects) {
        localStorage.setItem(`${KEYS.SUBJECTS_PREFIX}${userId}`, JSON.stringify(state.subjects));
        if (state.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(state.settings));
        if (state.usage) localStorage.setItem(KEYS.USAGE, JSON.stringify(state.usage));
        return state;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  calculateMasteryPoints: (subjects: SavedSubject[]): number => {
    if (!subjects || !Array.isArray(subjects)) return 0;
    return subjects.reduce((total, sub) => total + (sub.completedTopics?.length || 0), 0);
  }
};
