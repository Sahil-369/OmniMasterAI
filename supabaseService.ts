
import { createClient } from '@supabase/supabase-js';
import { Roadmap } from '../types';

const SUPABASE_URL = 'https://vjpollxwktdfuifhqvyi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcG9sbHh3a3RkZnVpZmhxdnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MjkyMzAsImV4cCI6MjA4NTQwNTIzMH0.MN6q02lfhVuG6RPVFK826XW7-f30am5lXhZDvWDlKv4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  // USER_DETAILS: userid, name, premium, masterypoints, daysstreak, email, password, paymentid, emoji
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_details')
      .select('userid, name, email, password, premium, masterypoints, daysstreak, paymentid, emoji')
      .eq('userid', userId.trim().toUpperCase())
      .maybeSingle();
    if (error) console.error("[Supabase] Profile Fetch Error:", error);
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const sanitizedId = userId.trim().toUpperCase();
    const { data, error } = await supabase
      .from('user_details')
      .update(updates)
      .eq('userid', sanitizedId);
    return { data, error };
  },

  async checkUser(email: string) {
    return await supabase
      .from('user_details')
      .select('userid')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
  },

  async checkMasterId(userId: string) {
    return await supabase
      .from('user_details')
      .select('userid')
      .eq('userid', userId.trim().toUpperCase())
      .maybeSingle();
  },

  async findUserByIdentifier(id: string) {
    const input = id.trim();
    const sanitizedId = input.toUpperCase().replace(/^OMNI-/, '');
    
    if (input.includes('@')) {
      return await supabase.from('user_details').select('*').eq('email', input.toLowerCase()).maybeSingle();
    } else {
      return await supabase.from('user_details').select('*').eq('userid', sanitizedId).maybeSingle();
    }
  },

  async createProfile(profile: any) {
    return await supabase.from('user_details').insert([{
      userid: profile.userid.toUpperCase(),
      name: profile.name,
      email: profile.email.toLowerCase(),
      password: profile.password,
      masterypoints: 0,
      daysstreak: 0,
      premium: false,
      emoji: profile.emoji || '',
      paymentid: ''
    }]);
  },

  // CHAT_LOGS: userid, content, showmasterypath, publicid, public_masterypath, notice, warning, updates
  async logChat(userId: string, content: any, settings: any) {
    const sanitizedId = userId.trim().toUpperCase();
    const { error } = await supabase
      .from('chat_logs')
      .upsert({
        userid: sanitizedId,
        content: content,
        showmasterypath: settings.isPublicPaths ?? false,
        publicid: settings.isPublicProfile ?? true,
        public_masterypath: settings.isPublicPaths ?? false
      }, { onConflict: 'userid' });
    return { error };
  },

  async getLatestSyncedState(userId: string) {
    const { data } = await supabase
      .from('chat_logs')
      .select('content')
      .eq('userid', userId.trim().toUpperCase())
      .maybeSingle();
    return data?.content || null;
  },

  async findGlobalRoadmap(subjectName: string): Promise<Roadmap | null> {
    try {
      const { data } = await supabase.from('chat_logs').select('content').not('content', 'is', null).limit(50);
      if (!data) return null;
      const searchTerm = subjectName.toLowerCase().trim();
      for (const row of data) {
        const subjects = row.content?.subjects;
        if (Array.isArray(subjects)) {
          const match = subjects.find((s: any) => s.subject?.toLowerCase() === searchTerm || s.roadmap?.subject?.toLowerCase() === searchTerm);
          if (match?.roadmap) return match.roadmap;
        }
      }
      return null;
    } catch { return null; }
  },

  async fetchNotice(userId: string) {
    const { data } = await supabase.from('chat_logs').select('notice, warning, updates').eq('userid', userId.trim().toUpperCase()).maybeSingle();
    return data || null;
  },

  async fetchLeaderboard() {
    const { data: users, error } = await supabase
      .from('user_details')
      .select('userid, name, masterypoints, premium, emoji')
      .order('masterypoints', { ascending: false })
      .limit(50);
    
    if (error) return [];

    const userIds = users.map(u => u.userid);
    const { data: logs } = await supabase
      .from('chat_logs')
      .select('userid, publicid, showmasterypath, content')
      .in('userid', userIds);

    return users.map(u => {
      const log = logs?.find(l => l.userid === u.userid);
      const isPublicPaths = log?.showmasterypath ?? false;
      
      // Extract subject progress for public profiles
      let publicSubjects: { subject: string, progress: number }[] = [];
      if (isPublicPaths && log?.content?.subjects) {
        publicSubjects = log.content.subjects.map((s: any) => {
          const total = s.roadmap?.steps?.reduce((acc: number, step: any) => acc + (step.topics?.length || 0), 0) || 1;
          const completed = s.completedTopics?.length || 0;
          return {
            subject: s.subject,
            progress: Math.round((completed / total) * 100)
          };
        });
      }

      return {
        masterId: `OMNI-${u.userid}`,
        name: u.name,
        emoji: u.emoji,
        totalMasteryPoints: u.masterypoints || 0,
        isPublicProfile: log?.publicid ?? true,
        isPublicPaths: isPublicPaths,
        isPremium: u.premium,
        publicSubjects,
        photoUrl: u.emoji 
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.emoji)}&background=indigo&color=fff&size=128&font-size=0.6`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&size=128`,
        subjectsCount: log?.content?.subjects?.length || 0
      };
    });
  }
};
