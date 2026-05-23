'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import api, { UserProfile } from '@/lib/api';
import { Code2, Users, MessageCircle, User, LogOut, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      const data = await api.getProfile(user.uid);
      setProfile(data.profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist, redirect to onboarding
      router.push('/onboarding');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-dark-lighter border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">LinkUp</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <Users className="inline mr-2" />
              Discover
            </Link>
            <Link href="/matches" className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="inline mr-2" />
              Matches
            </Link>
            <Link href="/profile" className="text-primary font-medium">
              <User className="inline mr-2" />
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="inline mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                  <p className="text-gray-400">{profile.tagline}</p>
                </div>
              </div>
              <Link href="/onboarding" className="btn-outline">
                <Edit className="inline mr-2 w-4 h-4" />
                Edit Profile
              </Link>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">About Me</h2>
                <p className="text-gray-400">{profile.bio}</p>
              </div>
            )}

            {/* Interests */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <span
                    key={interest}
                    className="bg-primary/20 text-primary px-4 py-2 rounded-full font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Build Habits */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Build Habits</h2>
              <div className="space-y-4">
                {Object.entries(profile.build_habits).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize text-gray-400">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-primary font-medium">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hackathon Scenarios */}
            <div>
              <h2 className="text-xl font-bold mb-4">Hackathon Style</h2>
              <div className="space-y-4">
                {Object.entries(profile.hackathon_scenarios).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize text-gray-400">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-secondary font-medium">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-secondary to-primary"
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
