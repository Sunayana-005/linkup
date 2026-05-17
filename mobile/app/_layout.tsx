import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../lib/firebase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../lib/colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if user has completed onboarding
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          setHasProfile(userDoc.exists());
        } catch {
          setHasProfile(false);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuthGroup) {
      router.replace('/auth');
    } else if (user && !hasProfile && !inOnboarding) {
      router.replace('/onboarding/step1');
    } else if (user && hasProfile && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)/swipe');
    }
  }, [user, loading, hasProfile, segments]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
