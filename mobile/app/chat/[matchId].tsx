import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc,
} from 'firebase/firestore';
import { auth, firestore } from '../../lib/firebase';
import { Colors } from '../../lib/colors';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherName, setOtherName] = useState('Chat');
  const flatListRef = useRef<FlatList>(null);
  const userId = auth.currentUser?.uid;

  // Fetch match info for header
  useEffect(() => {
    if (!matchId) return;
    const fetchMatchInfo = async () => {
      try {
        const matchDoc = await getDoc(doc(firestore, 'matches', matchId));
        if (matchDoc.exists()) {
          const data = matchDoc.data();
          const otherId = data.users?.find((id: string) => id !== userId);
          if (otherId) {
            const userDoc = await getDoc(doc(firestore, 'users', otherId));
            if (userDoc.exists()) {
              setOtherName(userDoc.data().display_name || 'Developer');
            }
          }
        }
      } catch (e) {
        console.warn('Could not load match info');
      }
    };
    fetchMatchInfo();
  }, [matchId]);

  // Real-time messages listener
  useEffect(() => {
    if (!matchId) return;
    const msgRef = collection(firestore, 'matches', matchId, 'messages');
    const q = query(msgRef, orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return unsub;
  }, [matchId]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !matchId || !userId) return;

    setInput('');
    try {
      const msgRef = collection(firestore, 'matches', matchId, 'messages');
      await addDoc(msgRef, {
        text,
        senderId: userId,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Failed to send message:', e);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === userId;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[styles.msgBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {isMe && (
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMid]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#111138']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerName} numberOfLines={1}>{otherName}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyChatText}>Say hello! 👋</Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity onPress={sendMessage} disabled={!input.trim()}>
            <LinearGradient
              colors={input.trim() ? [Colors.gradientStart, Colors.gradientMid] : [Colors.bgCard, Colors.bgCard]}
              style={styles.sendBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="send" size={18} color={input.trim() ? '#fff' : Colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerName: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  msgList: { padding: 16, paddingBottom: 8, flexGrow: 1, justifyContent: 'flex-end' },
  msgRow: { marginBottom: 8, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  msgBubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10,
    overflow: 'hidden',
  },
  theirBubble: { backgroundColor: Colors.bgCard, borderBottomLeftRadius: 4 },
  myBubble: { borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 20 },
  myMsgText: { color: '#fff' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyChatText: { color: Colors.textMuted, fontSize: 16, marginTop: 12 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: 'rgba(10,10,26,0.95)',
  },
  inputWrap: {
    flex: 1, backgroundColor: Colors.bgInput, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { color: Colors.text, fontSize: 15 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
});
