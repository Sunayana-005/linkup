'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import api, { UserProfile } from '@/lib/api';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

const INTERESTS = [
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'AI/ML', 'DevOps',
  'Blockchain', 'Game Dev', 'Data Science', 'Cybersecurity', 'Cloud',
  'UI/UX', 'IoT', 'AR/VR', 'Web3', 'Embedded Systems'
];

const BUILD_HABITS = [
  { key: 'planning', label: 'Planning vs Diving In', left: 'Plan First', right: 'Dive In' },
  { key: 'testing', label: 'Testing Approach', left: 'Test Everything', right: 'Move Fast' },
  { key: 'documentation', label: 'Documentation', left: 'Document All', right: 'Code Speaks' },
  { key: 'collaboration', label: 'Work Style', left: 'Solo Focus', right: 'Pair Program' },
];

const HACKATHON_SCENARIOS = [
  { key: 'team_size', label: 'Team Size Preference', left: 'Small (2-3)', right: 'Large (4+)' },
  { key: 'innovation', label: 'Project Focus', left: 'Polish Existing', right: 'Innovate New' },
  { key: 'competition', label: 'Competition Style', left: 'For Fun', right: 'To Win' },
  { key: 'time_management', label: 'Time Management', left: 'Steady Pace', right: 'Last Minute' },
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
      setFormData(prev => ({
        ...prev,
        display_name: user.displayName || '',
      }));
    }
  }, [user, loading, router]);

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSliderChange = (category: 'build_habits' | 'hackathon_scenarios', key: string, value: number) => {
    setFormData(prev => ({
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
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const canProceed = () => {
    if (step === 1) return formData.display_name && formData.tagline;
    if (step === 2) return formData.interests.length >= 3;
    if (step === 3) return Object.keys(formData.build_habits).length === BUILD_HABITS.length;
    if (step === 4) return Object.keys(formData.hackathon_scenarios).length === HACKATHON_SCENARIOS.length;
    return true;
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  s < step
                    ? 'bg-primary text-white'
                    : s === step
                    ? 'bg-primary text-white scale-110'
                    : 'bg-dark-lighter text-gray-500'
                }`}
              >
                {s < step ? <Check className="w-6 h-6" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="card">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Let's get started!</h2>
              <p className="text-gray-400">Tell us a bit about yourself</p>

              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={e => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="input-field"
                  placeholder="Full-stack developer passionate about AI"
                  maxLength={80}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.tagline.length}/80</p>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">What are your interests?</h2>
              <p className="text-gray-400">Select at least 3 areas you're passionate about</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-primary text-white scale-105'
                        : 'bg-dark-lighter text-gray-400 hover:bg-dark-card'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                Selected: {formData.interests.length} {formData.interests.length >= 3 && '✓'}
              </p>
            </div>
          )}

          {/* Step 3: Build Habits */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Your Build Habits</h2>
              <p className="text-gray-400">How do you approach development?</p>

              {BUILD_HABITS.map(habit => (
                <div key={habit.key} className="space-y-2">
                  <label className="block font-medium">{habit.label}</label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-24 text-right">{habit.left}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.build_habits[habit.key] || 0.5}
                      onChange={e => handleSliderChange('build_habits', habit.key, parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-24">{habit.right}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Hackathon Scenarios */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Hackathon Style</h2>
              <p className="text-gray-400">What's your ideal hackathon experience?</p>

              {HACKATHON_SCENARIOS.map(scenario => (
                <div key={scenario.key} className="space-y-2">
                  <label className="block font-medium">{scenario.label}</label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-24 text-right">{scenario.left}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.hackathon_scenarios[scenario.key] || 0.5}
                      onChange={e => handleSliderChange('hackathon_scenarios', scenario.key, parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-24">{scenario.right}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Bio */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Tell us more about you</h2>
              <p className="text-gray-400">Share your story, goals, or anything else!</p>

              <div>
                <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="input-field min-h-[150px]"
                  placeholder="I'm a passionate developer who loves building innovative solutions..."
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="inline mr-2" /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="inline ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Profile...' : 'Complete Setup'} <Check className="inline ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
