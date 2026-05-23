'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import api, { MatchResult } from '@/lib/api';
import {
  Heart,
  X,
  MessageCircle,
  User,
  LogOut,
} from 'lucide-react';
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
      const result = await api.recordSwipe(
        user.uid,
        currentMatch.user_id,
        action
      );

      if (result.is_match) {
        setShowMatch(true);

        setTimeout(() => {
          setShowMatch(false);
          setCurrentIndex((prev) => prev + 1);
        }, 2200);
      } else {
        setCurrentIndex((prev) => prev + 1);
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
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#D8CFC2] border-t-[#7C8C6C] animate-spin"></div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2D2D2D]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F7F4EE]/80 border-b border-[#E7E0D4]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              LinkUp
            </h1>
            <p className="text-sm text-[#8A8378]">
              find people you creatively click with
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/matches"
              className="text-[#7A756B] hover:text-black transition"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            <Link
              href="/profile"
              className="text-[#7A756B] hover:text-black transition"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={handleSignOut}
              className="text-[#7A756B] hover:text-black transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="px-6 py-10">
        <div className="max-w-md mx-auto">
          {currentMatch ? (
            <div className="relative">
              {/* CARD */}
              <div className="bg-white rounded-[38px] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-[#ECE5DA]">
                {/* TOP */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9C9489]">
                      Builder Aura
                    </p>

                    <h2 className="text-lg font-medium mt-1">
                      Chaotic Creative
                    </h2>
                  </div>

                  <div className="bg-[#EFE8DC] px-4 py-2 rounded-full text-sm text-[#6E675E]">
                    {Math.round(
                      currentMatch.similarity_score * 100
                    )}
                    % Match
                  </div>
                </div>

                {/* IMAGE */}
                <div className="relative mb-6">
                  <div className="aspect-[3/4] rounded-[30px] bg-gradient-to-br from-[#D8D2C6] to-[#EEE9E0] flex items-center justify-center overflow-hidden">
                    <span className="text-7xl font-semibold text-[#5E584E]">
                      {currentMatch.profile.display_name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  {/* FLOATING BADGE */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
                    <p className="text-xs text-[#8A8378]">
                      Peak Coding Hour
                    </p>
                    <p className="text-sm font-medium">
                      11PM → 3AM
                    </p>
                  </div>
                </div>

                {/* INFO */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold">
                      {currentMatch.profile.display_name}
                    </h1>

                    <div className="w-3 h-3 rounded-full bg-[#7C8C6C]" />
                  </div>

                  <p className="text-[#7F786E] mt-2 leading-relaxed">
                    {currentMatch.profile.tagline}
                  </p>
                </div>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentMatch.profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-2 rounded-full bg-[#F3EEE6] text-sm text-[#625C53]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* ABOUT */}
                {currentMatch.profile.bio && (
                  <div className="mb-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#A29B90] mb-3">
                      About
                    </p>

                    <p className="text-[#615B52] leading-relaxed">
                      {currentMatch.profile.bio}
                    </p>
                  </div>
                )}

                {/* BUILD HABITS */}
                <div className="mb-8">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#A29B90] mb-4">
                    Build Habits
                  </p>

                  <div className="space-y-4">
                    {Object.entries(
                      currentMatch.profile.build_habits
                    ).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize text-[#6D675D]">
                            {key.replace('_', ' ')}
                          </span>

                          <span className="text-[#7C8C6C]">
                            {Math.round(value * 100)}%
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[#EFE7DA] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#7C8C6C]"
                            style={{
                              width: `${Math.round(value * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => handleSwipe('pass')}
                    disabled={swiping}
                    className="w-16 h-16 rounded-full bg-[#EFE7DA] flex items-center justify-center transition hover:scale-105 active:scale-95"
                  >
                    <X className="w-7 h-7 text-[#6B655C]" />
                  </button>

                  <button
                    onClick={() => handleSwipe('like')}
                    disabled={swiping}
                    className="w-20 h-20 rounded-full bg-[#7C8C6C] flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95"
                  >
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </button>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="text-center mt-6 text-[#9A9288] text-sm">
                {currentIndex + 1} / {matches.length}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-12 text-center border border-[#ECE5DA] shadow-sm">
              <h2 className="text-2xl font-semibold mb-3">
                No more builders for now
              </h2>

              <p className="text-[#8C857A] mb-8">
                Come back later for fresh creative energy.
              </p>

              <button
                onClick={loadMatches}
                className="bg-[#7C8C6C] text-white px-6 py-3 rounded-full"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MATCH MODAL */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#FAF7F2] rounded-[36px] p-10 max-w-sm mx-4 text-center shadow-2xl border border-[#E9E2D6] animate-[fadeIn_.3s_ease]">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#7C8C6C] flex items-center justify-center">
                <Heart className="w-10 h-10 text-white fill-white" />
              </div>
            </div>

            <h2 className="text-4xl font-semibold mb-4">
              It’s a Match
            </h2>

            <p className="text-[#726B61] leading-relaxed">
              You both build best after midnight ☕
            </p>

            <button className="mt-8 bg-[#7C8C6C] text-white px-6 py-3 rounded-full">
              Start Building
            </button>
          </div>
        </div>
      )}
    </div>
  );
}