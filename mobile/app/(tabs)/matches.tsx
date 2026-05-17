import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../lib/firebase';
import api, { MatchedUser } from '../../lib/api';
import { Colors } from '../../lib/colors';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMatches = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.listMatches(userId);
      setMatches(data.matches);
    } catch (err) {
      console.warn('Failed to fetch matches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const renderMatch = ({ item }: { item: MatchedUser }) => (
    <TouchableOpacity
      style={styles.matchCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${item.match_id}`)}
    >
      <View style={styles.avatarWrap}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.avatar}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>
            {getInitials(item.profile?.display_name || 'U')}
          </Text>
        </LinearGradient>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.profile?.display_name || 'Developer'}</Text>
        <Text style={styles.matchTagline} numberOfLines={1}>
          {item.profile?.tagline || 'Tech enthusiast'}
        </Text>
      </View>
      <View style={styles.chatIcon}>
        <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#111138']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Ionicons name="heart" size={24} color={Colors.accent} />
        <Text style={styles.headerTitle}>Matches</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Keep swiping to find your build partners!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.match_id}
          renderItem={renderMatch}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  matchCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.bgCard, borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatarWrap: { borderRadius: 24, overflow: 'hidden' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  matchTagline: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  chatIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(124,92,252,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
});
