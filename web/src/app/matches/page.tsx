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
  <div className="min-h-screen bg-[#F7F4EE] text-[#2D2D2D]">
    {/* NAVBAR */}
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F7F4EE]/80 border-b border-[#E9E2D7]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            LinkUp
          </h1>

          <p className="text-sm text-[#8F877B]">
            people you creatively click with
          </p>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="text-[#7B746A] hover:text-black transition"
          >
            <Users className="w-5 h-5" />
          </Link>

          <Link
            href="/matches"
            className="text-[#7C8C6C]"
          >
            <MessageCircle className="w-5 h-5 fill-[#7C8C6C]" />
          </Link>

          <Link
            href="/profile"
            className="text-[#7B746A] hover:text-black transition"
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={handleSignOut}
            className="text-[#7B746A] hover:text-black transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>

    {/* MAIN */}
    <div className="px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#A59C91] mb-3">
            Your Circle
          </p>

          <h1 className="text-5xl font-semibold tracking-tight mb-3">
            Your matches
          </h1>

          <p className="text-[#7D766C] text-lg">
            builders you’d probably survive a hackathon with.
          </p>
        </div>

        {/* EMPTY STATE */}
        {matches.length === 0 ? (
          <div className="bg-white border border-[#ECE5DA] rounded-[40px] p-14 text-center shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="w-24 h-24 rounded-full bg-[#F3EEE6] flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="w-10 h-10 text-[#7C8C6C]" />
            </div>

            <h2 className="text-3xl font-semibold mb-4">
              No matches yet
            </h2>

            <p className="text-[#7D766C] text-lg max-w-md mx-auto mb-8 leading-relaxed">
              Start discovering builders that match your vibe,
              workflow, and creative energy.
            </p>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#7C8C6C] text-white hover:scale-[1.02] transition"
            >
              <Users className="w-4 h-4" />
              Start Matching
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match.match_id}
                className="bg-white border border-[#ECE5DA] rounded-[34px] p-6 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
              >
                {/* TOP */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {/* AVATAR */}
                    <div className="w-20 h-20 rounded-full bg-[#7C8C6C] flex items-center justify-center shadow-md">
                      <span className="text-3xl font-semibold text-white">
                        {match.profile.display_name
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>

                    {/* INFO */}
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {match.profile.display_name}
                      </h2>

                      <p className="text-[#7D766C] mt-2 leading-relaxed max-w-[220px]">
                        {match.profile.tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AURA TAGS */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {match.profile.interests
                    .slice(0, 4)
                    .map((interest) => (
                      <span
                        key={interest}
                        className="px-4 py-2 rounded-full bg-[#F5F1E9] text-[#645D54] text-sm"
                      >
                        {interest}
                      </span>
                    ))}

                  {match.profile.interests.length > 4 && (
                    <span className="px-4 py-2 rounded-full bg-[#F5F1E9] text-[#8D8579] text-sm">
                      +{match.profile.interests.length - 4}
                    </span>
                  )}
                </div>

                {/* MATCH ENERGY */}
                <div className="bg-[#F7F4EE] rounded-3xl p-5 mb-6 border border-[#ECE5DA]">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#AAA195] mb-3">
                    Build Chemistry
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[#5F584F]">
                      compatible build energy
                    </span>

                    <span className="text-[#7C8C6C] font-semibold">
                      high
                    </span>
                  </div>
                </div>

                {/* BUTTON */}
                <button className="w-full py-4 rounded-full bg-[#7C8C6C] text-white hover:scale-[1.01] transition flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Start Conversation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}
