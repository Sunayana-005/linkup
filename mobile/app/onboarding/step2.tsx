import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import api from '../../lib/api';
import { Colors } from '../../lib/colors';
import Slider from '../../components/Slider';

const SCENARIO_SLIDERS = [
  { key: 'idea_vs_execute', left: '💡 Ideation', right: 'Execution 🔨' },
  { key: 'learn_vs_ship', left: '📚 Learn New', right: 'Use Known 🏗️' },
  { key: 'design_vs_function', left: '🎨 Design-first', right: 'Function-first ⚡' },
  { key: 'pitch_vs_build', left: '🎤 Pitch Focus', right: 'Build Focus 🛠️' },
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const TEAM_SIZES = ['Solo', 'Duo (2)', 'Small (3-4)', 'Squad (5+)'];
const HACKATHON_FREQ = ['First timer', '1-2 done', '3-5 done', 'Veteran (6+)'];

export default function OnboardingStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const interests = JSON.parse((params.interests as string) || '[]');
  const habits = JSON.parse((params.habits as string) || '{}');

  const [scenarios, setScenarios] = useState<Record<string, number>>({
    idea_vs_execute: 0.5,
    learn_vs_ship: 0.5,
    design_vs_function: 0.5,
    pitch_vs_build: 0.5,
  });

  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [tagline, setTagline] = useState('');
  const [experience, setExperience] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [hackathonFreq, setHackathonFreq] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = displayName.trim() && experience && teamSize;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing info', 'Please fill in your name, experience level, and team size preference');
      return;
    }

    setLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const profile = {
      user_id: userId,
      display_name: displayName.trim(),
      avatar_url: auth.currentUser?.photoURL || '',
      tagline: tagline.trim() || `${experience} developer`,
      interests,
      build_habits: habits,
      hackathon_scenarios: scenarios,
      additional_preferences: {
        experience_level: experience,
        preferred_team_size: teamSize,
        hackathon_experience: hackathonFreq || 'First timer',
      },
      bio: bio.trim(),
    };

    try {
      // Save to Firestore directly
      await setDoc(doc(firestore, 'users', userId), profile);

      // Also send to backend for embedding computation
      try {
        await api.createProfile(profile);
      } catch (e) {
        // Backend might not be running; profile is still saved in Firestore
        console.warn('Backend sync failed (non-critical):', e);
      }

      router.replace('/(tabs)/swipe');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPillGroup = (
    options: string[],
    selected: string,
    onSelect: (val: string) => void
  ) => (
    <View style={styles.pillGroup}>
      {options.map((opt) => {
        const isActive = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelect(opt)}
            activeOpacity={0.7}
          >
            {isActive && (
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A1A', '#111138', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: '100%' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 2 of 2</Text>
        </View>

        <Text style={styles.title}>Almost there!</Text>
        <Text style={styles.subtitle}>A few more details to find your perfect match</Text>

        {/* Name */}
        <Text style={styles.fieldLabel}>Display Name *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="How others will see you"
            placeholderTextColor={Colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Tagline */}
        <Text style={styles.fieldLabel}>Tagline</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Full-stack dev who loves hackathons"
            placeholderTextColor={Colors.textMuted}
            value={tagline}
            onChangeText={setTagline}
          />
        </View>

        {/* Experience */}
        <Text style={styles.fieldLabel}>Experience Level *</Text>
        {renderPillGroup(EXPERIENCE_LEVELS, experience, setExperience)}

        {/* Team Size */}
        <Text style={styles.fieldLabel}>Preferred Team Size *</Text>
        {renderPillGroup(TEAM_SIZES, teamSize, setTeamSize)}

        {/* Hackathon Experience */}
        <Text style={styles.fieldLabel}>Hackathon Experience</Text>
        {renderPillGroup(HACKATHON_FREQ, hackathonFreq, setHackathonFreq)}

        {/* Scenario Sliders */}
        <Text style={styles.sectionTitle}>Hackathon approach</Text>
        <Text style={styles.sectionSubtitle}>How do you tackle hackathons?</Text>

        <View style={styles.slidersContainer}>
          {SCENARIO_SLIDERS.map((slider) => (
            <Slider
              key={slider.key}
              leftLabel={slider.left}
              rightLabel={slider.right}
              value={scenarios[slider.key]}
              onValueChange={(val) =>
                setScenarios((prev) => ({ ...prev, [slider.key]: val }))
              }
            />
          ))}
        </View>

        {/* Bio */}
        <Text style={styles.fieldLabel}>Bio</Text>
        <View style={[styles.inputContainer, styles.bioContainer]}>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell others what you're passionate about, your tech stack, past projects..."
            placeholderTextColor={Colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{bio.length}/500</Text>
      </ScrollView>

      {/* Submit */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          style={{ flex: 1, opacity: canSubmit ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>
              {loading ? 'Setting up...' : "Let's Go! 🚀"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 140,
  },
  progressContainer: { marginBottom: 32 },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressText: { color: Colors.textMuted, fontSize: 13, marginTop: 8 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 18,
  },
  inputContainer: {
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  input: {
    color: Colors.text,
    fontSize: 15,
  },
  bioContainer: {
    height: 120,
    paddingVertical: 14,
  },
  bioInput: {
    flex: 1,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pillActive: {
    borderColor: Colors.gradientStart,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 28,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  slidersContainer: {
    gap: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    paddingHorizontal: 16,
    gap: 6,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
