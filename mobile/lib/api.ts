// Backend API client for LinkUp FastAPI server
// Change this to your server's IP/domain
const API_BASE = __DEV__
  ? 'http://10.0.2.2:8000'  // Android emulator -> host machine
  : 'https://your-production-url.com';

// For physical device testing, use your computer's local IP:
// const API_BASE = 'http://192.168.x.x:8000';

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url: string;
  tagline: string;
  interests: string[];
  build_habits: Record<string, number>;
  hackathon_scenarios: Record<string, number>;
  additional_preferences: Record<string, string>;
  bio: string;
}

export interface MatchResult {
  user_id: string;
  profile: UserProfile;
  similarity_score: number;
}

export interface MatchedUser {
  match_id: string;
  user_id: string;
  profile: UserProfile;
  timestamp: any;
}

const api = {
  async createProfile(profile: UserProfile): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/api/profile/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async getMatches(userId: string, limit = 20): Promise<{ matches: MatchResult[] }> {
    const res = await fetch(`${API_BASE}/api/matches/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, limit }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async recordSwipe(userId: string, targetUserId: string, action: 'like' | 'pass'): Promise<{ status: string; is_match: boolean }> {
    const res = await fetch(`${API_BASE}/api/swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, target_user_id: targetUserId, action }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async listMatches(userId: string): Promise<{ matches: MatchedUser[] }> {
    const res = await fetch(`${API_BASE}/api/matches/list/${userId}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};

export default api;
