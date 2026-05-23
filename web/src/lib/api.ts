const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

class APIClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  async createProfile(profile: UserProfile): Promise<{ status: string; message: string }> {
    return this.request('/api/profile/create', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getProfile(userId: string): Promise<{ profile: UserProfile }> {
    return this.request(`/api/profile/${userId}`);
  }

  async getMatches(userId: string, limit = 20): Promise<{ matches: MatchResult[] }> {
    return this.request('/api/matches/get', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, limit }),
    });
  }

  async recordSwipe(
    userId: string,
    targetUserId: string,
    action: 'like' | 'pass'
  ): Promise<{ status: string; is_match: boolean }> {
    return this.request('/api/swipe', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        target_user_id: targetUserId,
        action,
      }),
    });
  }

  async listMatches(userId: string): Promise<{ matches: MatchedUser[] }> {
    return this.request(`/api/matches/list/${userId}`);
  }

  async healthCheck(): Promise<{ message: string; version: string }> {
    return this.request('/');
  }
}

const api = new APIClient();
export default api;
