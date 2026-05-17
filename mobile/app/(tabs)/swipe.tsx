import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder, Dimensions,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../lib/firebase';
import api, { MatchResult } from '../../lib/api';
import { Colors } from '../../lib/colors';
import SwipeCard from '../../components/SwipeCard';

const { width: SW } = Dimensions.get('window');
const SWIPE_THRESHOLD = SW * 0.25;

// Demo data shown when backend is offline
const DEMO_CARDS: MatchResult[] = [
  {
    user_id: 'demo1',
    profile: {
      user_id: 'demo1', display_name: 'Alex Chen', avatar_url: '',
      tagline: 'Full-stack dev · React & Node',
      interests: ['frontend', 'backend', 'ai_ml'],
      build_habits: {}, hackathon_scenarios: {},
      additional_preferences: { experience_level: 'Advanced', preferred_team_size: 'Small (3-4)', hackathon_experience: '3-5 done' },
      bio: 'Love building fast prototypes. Always looking for teammates who bring energy and creativity.',
    },
    similarity_score: 0.87,
  },
  {
    user_id: 'demo2',
    profile: {
      user_id: 'demo2', display_name: 'Priya Sharma', avatar_url: '',
      tagline: 'AI/ML Engineer · Python enthusiast',
      interests: ['ai_ml', 'data', 'backend', 'opensource'],
      build_habits: {}, hackathon_scenarios: {},
      additional_preferences: { experience_level: 'Expert', preferred_team_size: 'Duo (2)', hackathon_experience: 'Veteran (6+)' },
      bio: 'Building LLM-powered tools by day, open source by night.',
    },
    similarity_score: 0.82,
  },
  {
    user_id: 'demo3',
    profile: {
      user_id: 'demo3', display_name: 'Jordan Rivera', avatar_url: '',
      tagline: 'Mobile dev & UI designer',
      interests: ['mobile', 'design', 'frontend'],
      build_habits: {}, hackathon_scenarios: {},
      additional_preferences: { experience_level: 'Intermediate', preferred_team_size: 'Small (3-4)', hackathon_experience: '1-2 done' },
      bio: 'Passionate about beautiful, intuitive mobile experiences. Figma → React Native is my flow.',
    },
    similarity_score: 0.75,
  },
];

export default function SwipeScreen() {
  const [cards, setCards] = useState<MatchResult[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SW / 2, 0, SW / 2], outputRange: ['-8deg', '0deg', '8deg'], extrapolate: 'clamp',
  });
  const likeOp = position.x.interpolate({
    inputRange: [0, SW / 4], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const passOp = position.x.interpolate({
    inputRange: [-SW / 4, 0], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const nextScale = position.x.interpolate({
    inputRange: [-SW / 2, 0, SW / 2], outputRange: [1, 0.92, 1], extrapolate: 'clamp',
  });
  const nextOp = position.x.interpolate({
    inputRange: [-SW / 2, 0, SW / 2], outputRange: [1, 0.5, 1], extrapolate: 'clamp',
  });

  const fetchMatches = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setLoading(true);
    try {
      const data = await api.getMatches(uid, 20);
      setCards(data.matches.length ? data.matches : DEMO_CARDS);
    } catch {
      setCards(DEMO_CARDS);
    } finally {
      setIdx(0);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const swipe = async (dir: 'like' | 'pass') => {
    const card = cards[idx];
    if (!card) return;
    const toX = dir === 'like' ? SW * 1.5 : -SW * 1.5;
    Animated.spring(position, { toValue: { x: toX, y: 0 }, useNativeDriver: false, speed: 20, bounciness: 2 }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setIdx((p) => p + 1);
    });
    const uid = auth.currentUser?.uid;
    if (uid && !card.user_id.startsWith('demo')) {
      try {
        const res = await api.recordSwipe(uid, card.user_id, dir);
        if (res.is_match) { setMatchAlert(card.profile.display_name); setTimeout(() => setMatchAlert(null), 3000); }
      } catch {}
    } else if (dir === 'like' && Math.random() > 0.5) {
      setMatchAlert(card.profile.display_name);
      setTimeout(() => setMatchAlert(null), 3000);
    }
  };

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
    onPanResponderMove: (_, g) => { position.setValue({ x: g.dx, y: g.dy * 0.3 }); },
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) swipe('like');
      else if (g.dx < -SWIPE_THRESHOLD) swipe('pass');
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 5 }).start();
    },
  })).current;

  if (loading) {
    return (
      <View style={s.center}>
        <LinearGradient colors={['#0A0A1A', '#111138']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.loadTxt}>Finding your people...</Text>
      </View>
    );
  }

  const cur = cards[idx];
  const next = cards[idx + 1];

  if (!cur) {
    return (
      <View style={s.center}>
        <LinearGradient colors={['#0A0A1A', '#111138']} style={StyleSheet.absoluteFill} />
        <View style={s.emptyIcon}><Ionicons name="search" size={48} color={Colors.textMuted} /></View>
        <Text style={s.emptyTitle}>All caught up!</Text>
        <Text style={s.emptySub}>No more profiles right now.{'\n'}Check back soon!</Text>
        <TouchableOpacity onPress={fetchMatches}>
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid]} style={s.refreshBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={s.refreshTxt}>Refresh</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <LinearGradient colors={['#0A0A1A', '#111138']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLogo}>
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={s.miniLogo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="code-slash" size={16} color="#fff" />
          </LinearGradient>
          <Text style={s.headerTitle}>Discover</Text>
        </View>
        <Text style={s.cardCount}>{idx + 1}/{cards.length}</Text>
      </View>

      {/* Card Stack */}
      <View style={s.stack}>
        {next && (
          <Animated.View style={[s.cardWrap, s.nextCard, { transform: [{ scale: nextScale }], opacity: nextOp }]}>
            <SwipeCard profile={next.profile} score={next.similarity_score} />
          </Animated.View>
        )}
        <Animated.View style={[s.cardWrap, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]} {...pan.panHandlers}>
          <Animated.View style={[s.stamp, s.likeStamp, { opacity: likeOp }]}><Text style={s.stampTxt}>LIKE</Text></Animated.View>
          <Animated.View style={[s.stamp, s.passStamp, { opacity: passOp }]}><Text style={[s.stampTxt, { color: Colors.swipeLeft }]}>PASS</Text></Animated.View>
          <SwipeCard profile={cur.profile} score={cur.similarity_score} />
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={s.actions}>
        <TouchableOpacity style={[s.actBtn, s.passBtn]} onPress={() => swipe('pass')}>
          <Ionicons name="close" size={30} color={Colors.swipeLeft} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.actBtn, s.likeBtn]} onPress={() => swipe('like')}>
          <Ionicons name="heart" size={28} color={Colors.swipeRight} />
        </TouchableOpacity>
      </View>

      {/* Match Alert */}
      {matchAlert && (
        <View style={s.alertWrap}>
          <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={s.alert} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={s.alertTxt}>It's a match with {matchAlert}! 🎉</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  loadTxt: { color: Colors.textSecondary, fontSize: 16, marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniLogo: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  cardCount: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  stack: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  cardWrap: { position: 'absolute' },
  nextCard: { top: 10 },
  stamp: { position: 'absolute', top: 40, zIndex: 10, borderWidth: 3, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  likeStamp: { right: 30, borderColor: Colors.swipeRight, transform: [{ rotate: '-15deg' }] },
  passStamp: { left: 30, borderColor: Colors.swipeLeft, transform: [{ rotate: '15deg' }] },
  stampTxt: { fontSize: 28, fontWeight: '900', color: Colors.swipeRight },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingBottom: 24 },
  actBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  passBtn: { borderColor: Colors.swipeLeft, backgroundColor: 'rgba(255,107,107,0.1)' },
  likeBtn: { borderColor: Colors.swipeRight, backgroundColor: 'rgba(74,222,128,0.1)' },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  refreshTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  alertWrap: { position: 'absolute', top: 100, left: 20, right: 20, alignItems: 'center', zIndex: 100 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
  alertTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
