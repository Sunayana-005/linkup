'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import api, { MatchedUser } from '@/lib/api';
import { Code2, Users, MessageCircle, User, LogOut, Mail } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

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
      const data = await api.listMatches(user.uid);
      setMatches(data.matches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoadingMatches(false);
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
            <Link href="/matches" className="text-primary font-medium">
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Your Matches</h1>

          {matches.length === 0 ? (
            <div className="card text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
              <p className="text-gray-400 mb-6">
                Start swiping to find your perfect dev partner!
              </p>
              <Link href="/dashboard" className="btn-primary">
                Start Swiping
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {matches.map(match => (
                <div key={match.match_id} className="card card-hover">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold flex-shrink-0">
                      {match.profile.display_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 truncate">
                        {match.profile.display_name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {match.profile.tagline}
                      </p>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {match.profile.interests.slice(0, 3).map(interest => (
                          <span
                            key={interest}
                            className="bg-dark-lighter px-2 py-1 rounded text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                        {match.profile.interests.length > 3 && (
                          <span className="bg-dark-lighter px-2 py-1 rounded text-xs text-gray-500">
                            +{match.profile.interests.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button className="btn-primary w-full text-sm py-2">
                        <Mail className="inline mr-2 w-4 h-4" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
