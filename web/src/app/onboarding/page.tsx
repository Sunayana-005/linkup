'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import api, { UserProfile } from '@/lib/api';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

const INTERESTS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'Mobile',
  'AI/ML',
  'DevOps',
  'Blockchain',
  'Game Dev',
  'Data Science',
  'Cybersecurity',
  'Cloud',
  'UI/UX',
  'IoT',
  'AR/VR',
  'Web3',
  'Embedded Systems',
];

const BUILD_HABITS = [
  {
    key: 'planning',
    label: 'Planning vs Diving In',
    left: 'Plan First',
    right: 'Dive In',
  },
  {
    key: 'testing',
    label: 'Testing Approach',
    left: 'Test Everything',
    right: 'Move Fast',
  },
  {
    key: 'documentation',
    label: 'Documentation',
    left: 'Document All',
    right: 'Code Speaks',
  },
  {
    key: 'collaboration',
    label: 'Work Style',
    left: 'Solo Focus',
    right: 'Pair Program',
  },
];

const HACKATHON_SCENARIOS = [
  {
    key: 'team_size',
    label: 'Team Size Preference',
    left: 'Small',
    right: 'Large',
  },
  {
    key: 'innovation',
    label: 'Project Focus',
    left: 'Polish',
    right: 'Innovate',
  },
  {
    key: 'competition',
    label: 'Competition Style',
    left: 'For Fun',
    right: 'To Win',
  },
  {
    key: 'time_management',
    label: 'Time Management',
    left: 'Steady',
    right: 'Chaotic',
  },
];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    tagline: '',
    interests: [] as string[],
    build_habits: {} as Record<string, number>,
    hackathon_scenarios: {} as Record<string, number>,
    bio: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        display_name: user.displayName || '',
      }));
    }
  }, [user, loading, router]);

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSliderChange = (
    category: 'build_habits' | 'hackathon_scenarios',
    key: string,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);

    try {
      const profile: UserProfile = {
        user_id: user.uid,
        display_name: formData.display_name,
        avatar_url: user.photoURL || '',
        tagline: formData.tagline,
        interests: formData.interests,
        build_habits: formData.build_habits,
        hackathon_scenarios: formData.hackathon_scenarios,
        additional_preferences: {},
        bio: formData.bio,
      };

      await api.createProfile(profile);

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1)
      return formData.display_name && formData.tagline;

    if (step === 2)
      return formData.interests.length >= 3;

    if (step === 3)
      return (
        Object.keys(formData.build_habits).length ===
        BUILD_HABITS.length
      );

    if (step === 4)
      return (
        Object.keys(formData.hackathon_scenarios).length ===
        HACKATHON_SCENARIOS.length
      );

    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#DDD4C7] border-t-[#7C8C6C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2B28] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm tracking-[0.25em] uppercase text-[#9A9287] mb-3">
            LinkUp Onboarding
          </p>

          <h1 className="text-5xl font-semibold tracking-tight">
            Build your builder identity
          </h1>

          <p className="text-[#7F786E] mt-4 text-lg">
            Let people discover the kind of creator you are.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-3 rounded-full transition-all duration-500 ${
                  s <= step
                    ? 'bg-[#7C8C6C] flex-1'
                    : 'bg-[#E5DDD0] flex-1'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between text-sm text-[#9A9287]">
            <span>Profile</span>
            <span>Interests</span>
            <span>Habits</span>
            <span>Hackathons</span>
            <span>Bio</span>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white border border-[#ECE4D8] rounded-[38px] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#9B9488] mb-3">
                  Step 01
                </p>

                <h2 className="text-4xl font-semibold mb-3">
                  Introduce yourself
                </h2>

                <p className="text-[#7C756B]">
                  Give your future teammates a first impression.
                </p>
              </div>

              <div>
                <label className="block mb-3 text-sm text-[#8A8378]">
                  Display Name
                </label>

                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="Sunayana"
                  className="w-full bg-[#F8F5F0] border border-[#E8E0D4] rounded-2xl px-5 py-4 outline-none focus:border-[#7C8C6C] transition"
                />
              </div>

              <div>
                <label className="block mb-3 text-sm text-[#8A8378]">
                  Tagline
                </label>

                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tagline: e.target.value,
                    }))
                  }
                  placeholder="chaotic frontend builder with too many ideas"
                  maxLength={80}
                  className="w-full bg-[#F8F5F0] border border-[#E8E0D4] rounded-2xl px-5 py-4 outline-none focus:border-[#7C8C6C] transition"
                />

                <p className="mt-2 text-sm text-[#A29B90]">
                  {formData.tagline.length}/80
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.25em] text-[#9B9488] mb-3">
                  Step 02
                </p>

                <h2 className="text-4xl font-semibold mb-3">
                  What do you build?
                </h2>

                <p className="text-[#7C756B]">
                  Pick the spaces you genuinely enjoy working in.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {INTERESTS.map((interest) => {
                  const selected =
                    formData.interests.includes(interest);

                  return (
                    <button
                      key={interest}
                      onClick={() =>
                        handleInterestToggle(interest)
                      }
                      className={`px-5 py-3 rounded-full transition-all text-sm ${
                        selected
                          ? 'bg-[#7C8C6C] text-white shadow-md'
                          : 'bg-[#F3EEE6] text-[#655F56] hover:bg-[#EAE3D7]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-[#9A9287]">
                {formData.interests.length} selected
              </p>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-10">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#9B9488] mb-3">
                  Step 03
                </p>

                <h2 className="text-4xl font-semibold mb-3">
                  Your build habits
                </h2>

                <p className="text-[#7C756B]">
                  Tell us how you approach creating things.
                </p>
              </div>

              {BUILD_HABITS.map((habit) => (
                <div key={habit.key}>
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">
                      {habit.label}
                    </span>

                    <span className="text-[#8F877C] text-sm">
                      {Math.round(
                        (formData.build_habits[habit.key] ||
                          0.5) * 100
                      )}
                      %
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#9B9388] w-24 text-right">
                      {habit.left}
                    </span>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={
                        formData.build_habits[habit.key] || 0.5
                      }
                      onChange={(e) =>
                        handleSliderChange(
                          'build_habits',
                          habit.key,
                          parseFloat(e.target.value)
                        )
                      }
                      className="flex-1 accent-[#7C8C6C]"
                    />

                    <span className="text-sm text-[#9B9388] w-24">
                      {habit.right}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-10">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#9B9488] mb-3">
                  Step 04
                </p>

                <h2 className="text-4xl font-semibold mb-3">
                  Hackathon energy
                </h2>

                <p className="text-[#7C756B]">
                  What kind of teammate are you under pressure?
                </p>
              </div>

              {HACKATHON_SCENARIOS.map((scenario) => (
                <div key={scenario.key}>
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">
                      {scenario.label}
                    </span>

                    <span className="text-[#8F877C] text-sm">
                      {Math.round(
                        (formData.hackathon_scenarios[
                          scenario.key
                        ] || 0.5) * 100
                      )}
                      %
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#9B9388] w-24 text-right">
                      {scenario.left}
                    </span>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={
                        formData.hackathon_scenarios[
                          scenario.key
                        ] || 0.5
                      }
                      onChange={(e) =>
                        handleSliderChange(
                          'hackathon_scenarios',
                          scenario.key,
                          parseFloat(e.target.value)
                        )
                      }
                      className="flex-1 accent-[#7C8C6C]"
                    />

                    <span className="text-sm text-[#9B9388] w-24">
                      {scenario.right}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#9B9488] mb-3">
                  Final Step
                </p>

                <h2 className="text-4xl font-semibold mb-3">
                  Add your story
                </h2>

                <p className="text-[#7C756B]">
                  Share your vibe, goals, or creative chaos.
                </p>
              </div>

              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                placeholder="i love building random things at 2am and pretending i’ll sleep early tomorrow."
                maxLength={500}
                className="w-full min-h-[220px] bg-[#F8F5F0] border border-[#E8E0D4] rounded-[28px] p-6 outline-none resize-none focus:border-[#7C8C6C] transition"
              />

              <p className="text-sm text-[#A29B90]">
                {formData.bio.length}/500
              </p>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-between mt-12 pt-8 border-t border-[#EFE7DA]">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="px-6 py-3 rounded-full bg-[#F3EEE6] text-[#5F594F] flex items-center gap-2 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="px-7 py-3 rounded-full bg-[#7C8C6C] text-white flex items-center gap-2 disabled:opacity-40"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-7 py-3 rounded-full bg-[#7C8C6C] text-white flex items-center gap-2 disabled:opacity-40"
              >
                {submitting
                  ? 'Creating...'
                  : 'Complete Setup'}

                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}