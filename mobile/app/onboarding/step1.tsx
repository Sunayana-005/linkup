import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import Slider from '../../components/Slider';

const { width } = Dimensions.get('window');

const INTEREST_OPTIONS = [
  { id: 'frontend', label: 'Frontend', icon: 'desktop-outline' },
  { id: 'backend', label: 'Backend', icon: 'server-outline' },
  { id: 'mobile', label: 'Mobile Dev', icon: 'phone-portrait-outline' },
  { id: 'ai_ml', label: 'AI / ML', icon: 'sparkles-outline' },
  { id: 'devops', label: 'DevOps', icon: 'cloud-outline' },
  { id: 'design', label: 'UI/UX Design', icon: 'color-palette-outline' },
  { id: 'blockchain', label: 'Web3', icon: 'link-outline' },
  { id: 'gamedev', label: 'Game Dev', icon: 'game-controller-outline' },
  { id: 'data', label: 'Data Science', icon: 'bar-chart-outline' },
  { id: 'security', label: 'Cybersecurity', icon: 'shield-checkmark-outline' },
  { id: 'iot', label: 'IoT / Hardware', icon: 'hardware-chip-outline' },
  { id: 'opensource', label: 'Open Source', icon: 'git-branch-outline' },
];

const HABIT_SLIDERS = [
  { key: 'planning_vs_hacking', left: '🗒️ Planner', right: 'Hacker 💻' },
  { key: 'solo_vs_collab', left: '🧑 Solo', right: 'Team 👥' },
  { key: 'frontend_vs_backend', left: '🎨 Frontend', right: 'Backend ⚙️' },
  { key: 'night_vs_morning', left: '🌙 Night Owl', right: 'Early Bird 🌅' },
  { key: 'move_fast_vs_careful', left: '🚀 Move Fast', right: 'Ship Solid 🛡️' },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [habits, setHabits] = useState<Record<string, number>>({
    planning_vs_hacking: 0.5,
    solo_vs_collab: 0.5,
    frontend_vs_backend: 0.5,
    night_vs_morning: 0.5,
    move_fast_vs_careful: 0.5,
  });

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 6
        ? [...prev, id]
        : prev
    );
  };

  const canProceed = selectedInterests.length >= 2;

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/step2',
      params: {
        interests: JSON.stringify(selectedInterests),
        habits: JSON.stringify(habits),
      },
    });
  };

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
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: '50%' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 1 of 2</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>What excites you?</Text>
        <Text style={styles.subtitle}>
          Pick 2–6 interests so we can match you with like-minded devs
        </Text>

        {/* Interest Grid */}
        <View style={styles.interestGrid}>
          {INTEREST_OPTIONS.map((item) => {
            const isSelected = selectedInterests.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                onPress={() => toggleInterest(item.id)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientMid]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={isSelected ? '#fff' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.interestLabel,
                    isSelected && styles.interestLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Build Habits Sliders */}
        <Text style={styles.sectionTitle}>Your build style</Text>
        <Text style={styles.sectionSubtitle}>
          Slide to show where you fall on each spectrum
        </Text>

        <View style={styles.slidersContainer}>
          {HABIT_SLIDERS.map((slider) => (
            <Slider
              key={slider.key}
              leftLabel={slider.left}
              rightLabel={slider.right}
              value={habits[slider.key]}
              onValueChange={(val) =>
                setHabits((prev) => ({ ...prev, [slider.key]: val }))
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canProceed}
          style={{ opacity: canProceed ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
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
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 36,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  interestChipSelected: {
    borderColor: Colors.gradientStart,
  },
  interestLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  interestLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  slidersContainer: {
    gap: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 36,
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 17,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
