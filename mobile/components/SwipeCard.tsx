import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';
import { UserProfile } from '../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface SwipeCardProps {
  profile: UserProfile;
  score?: number;
}

const interestIcons: Record<string, string> = {
  frontend: 'desktop-outline',
  backend: 'server-outline',
  mobile: 'phone-portrait-outline',
  ai_ml: 'sparkles-outline',
  devops: 'cloud-outline',
  design: 'color-palette-outline',
  blockchain: 'link-outline',
  gamedev: 'game-controller-outline',
  data: 'bar-chart-outline',
  security: 'shield-checkmark-outline',
  iot: 'hardware-chip-outline',
  opensource: 'git-branch-outline',
};

const interestLabels: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  mobile: 'Mobile',
  ai_ml: 'AI/ML',
  devops: 'DevOps',
  design: 'Design',
  blockchain: 'Web3',
  gamedev: 'Game Dev',
  data: 'Data',
  security: 'Security',
  iot: 'IoT',
  opensource: 'Open Source',
};

export default function SwipeCard({ profile, score }: SwipeCardProps) {
  const initials = (profile.display_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#1A1A3E', '#111128', '#0F0F25']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
      />

      {/* Avatar & Name Section */}
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </View>
        <View style={styles.nameSection}>
          <Text style={styles.displayName} numberOfLines={1}>
            {profile.display_name || 'Developer'}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {profile.tagline || 'Tech enthusiast'}
          </Text>
          {score !== undefined && (
            <View style={styles.scoreBadge}>
              <LinearGradient
                colors={
                  score > 0.7
                    ? [Colors.success, '#00b894']
                    : score > 0.4
                    ? [Colors.gradientStart, Colors.gradientMid]
                    : [Colors.warning, '#e17055']
                }
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Text style={styles.scoreText}>
                {Math.round(score * 100)}% match
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipRow}>
            {profile.interests.slice(0, 5).map((interest) => (
              <View key={interest} style={styles.chip}>
                <Ionicons
                  name={(interestIcons[interest] || 'code-slash') as any}
                  size={14}
                  color={Colors.primaryLight}
                />
                <Text style={styles.chipText}>
                  {interestLabels[interest] || interest}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bio */}
      {profile.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.bioText} numberOfLines={3}>
            {profile.bio}
          </Text>
        </View>
      ) : null}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {profile.additional_preferences?.experience_level && (
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={16} color={Colors.accentCyan} />
            <Text style={styles.statText}>
              {profile.additional_preferences.experience_level}
            </Text>
          </View>
        )}
        {profile.additional_preferences?.preferred_team_size && (
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={Colors.accent} />
            <Text style={styles.statText}>
              {profile.additional_preferences.preferred_team_size}
            </Text>
          </View>
        )}
        {profile.additional_preferences?.hackathon_experience && (
          <View style={styles.statItem}>
            <Ionicons name="rocket-outline" size={16} color={Colors.warning} />
            <Text style={styles.statText}>
              {profile.additional_preferences.hackathon_experience}
            </Text>
          </View>
        )}
      </View>

      {/* Swipe Hints */}
      <View style={styles.hintRow}>
        <View style={[styles.hintBubble, styles.hintPass]}>
          <Ionicons name="close" size={16} color={Colors.swipeLeft} />
          <Text style={[styles.hintText, { color: Colors.swipeLeft }]}>Pass</Text>
        </View>
        <View style={[styles.hintBubble, styles.hintLike]}>
          <Text style={[styles.hintText, { color: Colors.swipeRight }]}>Like</Text>
          <Ionicons name="heart" size={16} color={Colors.swipeRight} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    minHeight: 440,
    justifyContent: 'space-between',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  nameSection: {
    flex: 1,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 92, 252, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.2)',
  },
  chipText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '500',
  },
  bioText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintPass: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  hintLike: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
