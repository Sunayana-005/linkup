'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import api, { MatchResult } from '@/lib/api';
import { Heart, X, Users, MessageCircle, User, LogOut, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    
    setLoadingMatches(true);
    try {
      const data = await api.getMatches(user.uid, 20);
      setMatches(data.matches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (!user || swiping || currentIndex >= matches.length) return;

    setSwiping(true);
    const currentMatch = matches[currentIndex];

    try {
      const result = await api.recordSwipe(user.uid, currentMatch.user_id, action);
      
      if (result.is_match) {
        setShowMatch(true);
        setTimeout(() => {
          setShowMatch(false);
          setCurrentIndex(prev => prev + 1);
        }, 2000);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    } finally {
      setSwiping(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || loadingMatches) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

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
            <Link href="/dashboard" className="text-primary font-medium">
              <Users className="inline mr-2" />
              Discover
            </Link>
            <Link href="/matches" className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="inline mr-2" />
              Matches
            </Link>
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
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
        <div className="max-w-2xl mx-auto">
          {currentMatch ? (
            <div className="relative">
              {/* Match Card */}
              <div className="card card-hover">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold">
                    {currentMatch.profile.display_name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Info */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2">{currentMatch.profile.display_name}</h2>
                  <p className="text-gray-400 text-lg mb-4">{currentMatch.profile.tagline}</p>
                  <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full font-medium">
                    {Math.round(currentMatch.similarity_score * 100)}% Match
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.profile.interests.map(interest => (
                      <span
                        key={interest}
                        className="bg-dark-lighter px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                {currentMatch.profile.bio && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">About</h3>
                    <p className="text-gray-400">{currentMatch.profile.bio}</p>
                  </div>
                )}

                {/* Build Habits */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Build Habits</h3>
                  <div className="space-y-2">
                    {Object.entries(currentMatch.profile.build_habits).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-primary">{Math.round(value * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-8">
                  <button
                    onClick={() => handleSwipe('pass')}
                    disabled={swiping}
                    className="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                  >
                    <X className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={() => handleSwipe('like')}
                    disabled={swiping}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="text-center mt-6 text-gray-500">
                {currentIndex + 1} / {matches.length}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No more matches</h2>
              <p className="text-gray-400 mb-6">Check back later for new potential teammates!</p>
              <button onClick={loadMatches} className="btn-primary">
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Match Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
          <div className="card text-center max-w-md animate-slide-up">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">It's a Match!</h2>
            <p className="text-gray-400 text-lg">
              You and {currentMatch?.profile.display_name} liked each other!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
