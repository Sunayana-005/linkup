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
  <div className="min-h-screen bg-[#F7F4EE] text-[#2D2D2D]">
    {/* NAVBAR */}
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F7F4EE]/80 border-b border-[#E9E2D7]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            LinkUp
          </h1>

          <p className="text-sm text-[#8F877B]">
            your builder identity
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
            className="text-[#7B746A] hover:text-black transition"
          >
            <MessageCircle className="w-5 h-5" />
          </Link>

          <Link
            href="/profile"
            className="text-[#7C8C6C]"
          >
            <User className="w-5 h-5 fill-[#7C8C6C]" />
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
      <div className="max-w-4xl mx-auto">
        {/* PROFILE CARD */}
        <div className="bg-white border border-[#ECE5DA] rounded-[38px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          
          {/* TOP BANNER */}
          <div className="h-40 bg-gradient-to-br from-[#DCD4C8] via-[#F2ECE2] to-[#E7E0D4]" />

          {/* CONTENT */}
          <div className="px-8 pb-10">
            {/* PROFILE HEADER */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-16 mb-10">
              
              <div className="flex items-end gap-5">
                {/* AVATAR */}
                <div className="w-32 h-32 rounded-full bg-[#7C8C6C] border-[6px] border-white flex items-center justify-center shadow-lg">
                  <span className="text-5xl font-semibold text-white">
                    {profile.display_name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>

                {/* INFO */}
                <div className="pb-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#A49C91] mb-2">
                    Builder Aura
                  </p>

                  <h1 className="text-4xl font-semibold tracking-tight">
                    {profile.display_name}
                  </h1>

                  <p className="text-[#7E766B] mt-2 text-lg">
                    {profile.tagline}
                  </p>
                </div>
              </div>

              {/* EDIT BUTTON */}
              <Link
                href="/onboarding"
                className="h-fit px-5 py-3 rounded-full bg-[#F3EEE6] text-[#5F584F] hover:bg-[#ECE3D7] transition"
              >
                <Edit className="inline w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </div>

            {/* BUILDER TAGS */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="px-4 py-2 rounded-full bg-[#F3EEE6] text-[#625B52] text-sm">
                Night Owl
              </div>

              <div className="px-4 py-2 rounded-full bg-[#F3EEE6] text-[#625B52] text-sm">
                Chaos Builder
              </div>

              <div className="px-4 py-2 rounded-full bg-[#F3EEE6] text-[#625B52] text-sm">
                MVP Maxxer
              </div>
            </div>

            {/* BIO */}
            {profile.bio && (
              <div className="mb-12">
                <p className="text-sm uppercase tracking-[0.2em] text-[#A49C91] mb-4">
                  About
                </p>

                <p className="text-[#5F584F] leading-relaxed text-lg">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* INTERESTS */}
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-[#A49C91] mb-5">
                Interests
              </p>

              <div className="flex flex-wrap gap-3">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-5 py-3 rounded-full bg-[#F7F4EE] text-[#5F584F] border border-[#E7E0D5]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* BUILD HABITS */}
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-[#A49C91] mb-6">
                Build Habits
              </p>

              <div className="space-y-6">
                {Object.entries(profile.build_habits).map(
                  ([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-3">
                        <span className="capitalize text-[#6A635A]">
                          {key.replace('_', ' ')}
                        </span>

                        <span className="text-[#7C8C6C] font-medium">
                          {Math.round(value * 100)}%
                        </span>
                      </div>

                      <div className="w-full h-3 rounded-full bg-[#EEE7DB] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#7C8C6C]"
                          style={{
                            width: `${value * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* HACKATHON STYLE */}
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#A49C91] mb-6">
                Hackathon Style
              </p>

              <div className="space-y-6">
                {Object.entries(
                  profile.hackathon_scenarios
                ).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-3">
                      <span className="capitalize text-[#6A635A]">
                        {key.replace('_', ' ')}
                      </span>

                      <span className="text-[#A07C66] font-medium">
                        {Math.round(value * 100)}%
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-[#EEE7DB] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C6A48B]"
                        style={{
                          width: `${value * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
