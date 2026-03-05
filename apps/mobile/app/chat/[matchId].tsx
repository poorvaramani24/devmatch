import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { matchApi, getIcebreakers } from '@/services/api';
import { wsService } from '@/services/websocket';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import Avatar from '@/components/Avatar';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import IcebreakerChips from '@/components/IcebreakerChips';
import type { Message, Match } from '@/types';

export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [input, setInput] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!matchId) return;
    loadMessages();
    loadMatch();
    loadIcebreakers();

    const unsubMessage = wsService.on('message', (data) => {
      if (data.match_id === matchId) {
        const newMsg: Message = {
          id: data.id as string,
          match_id: data.match_id as string,
          sender_id: data.sender_id as string,
          content: data.content as string,
          content_type: data.content_type as string,
          read_at: null,
          created_at: data.created_at as string,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    const unsubTyping = wsService.on('typing', (data) => {
      if (data.match_id === matchId && data.user_id !== userId) {
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
    };
  }, [matchId]);

  const loadMessages = async () => {
    if (!matchId) return;
    try {
      const { data } = await matchApi.getMessages(matchId);
      setMessages(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load messages' });
    }
  };

  const loadMatch = async () => {
    try {
      const { data } = await matchApi.getMatches();
      const match = data.find((m: Match) => m.id === matchId);
      if (match) setCurrentMatch(match);
    } catch {
      // Ignore
    }
  };

  const loadIcebreakers = async () => {
    try {
      const { data } = await getIcebreakers();
      setIcebreakers(data.prompts);
    } catch {
      // Ignore
    }
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || !matchId) return;

    const contentType = isCode ? 'code' : 'text';
    wsService.sendMessage(matchId, input.trim(), contentType);

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        match_id: matchId,
        sender_id: userId!,
        content: input.trim(),
        content_type: contentType,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ]);
    setInput('');
    setIsCode(false);
  }, [input, matchId, userId, isCode]);

  const handleTyping = useCallback(() => {
    if (matchId) {
      wsService.sendTyping(matchId);
    }
  }, [matchId]);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} isMine={item.sender_id === userId} />
  ), [userId]);

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.dark[700],
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark[400]} />
          </TouchableOpacity>
          {currentMatch && (
            <>
              <Avatar name={currentMatch.other_user.display_name} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 16 }}>
                  {currentMatch.other_user.display_name}
                </Text>
                <Text style={{ color: Colors.dark[400], fontSize: 12 }}>
                  {currentMatch.other_user.role} · {Math.round(currentMatch.compatibility_score)}% match
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 }}>
              <Ionicons name="sparkles-outline" size={32} color={Colors.dark[500]} style={{ marginBottom: 12 }} />
              <Text style={{ color: Colors.dark[400], marginBottom: 4 }}>Start the conversation!</Text>
              <Text style={{ color: Colors.dark[500], fontSize: 14 }}>Try an icebreaker below</Text>
            </View>
          }
          ListFooterComponent={typing ? <TypingIndicator /> : null}
        />

        {/* Icebreakers */}
        {showIcebreakers && icebreakers.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <IcebreakerChips
              prompts={icebreakers}
              onSelect={(prompt) => {
                setInput(prompt);
                setShowIcebreakers(false);
              }}
            />
          </View>
        )}

        {/* Input area */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: Colors.dark[700],
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity
                onPress={() => setShowIcebreakers(!showIcebreakers)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: showIcebreakers ? Colors.primary[600] : Colors.transparent,
                }}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={18}
                  color={showIcebreakers ? Colors.white : Colors.dark[400]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsCode(!isCode)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: isCode ? Colors.primary[600] : Colors.transparent,
                }}
              >
                <Ionicons
                  name="code-slash-outline"
                  size={18}
                  color={isCode ? Colors.white : Colors.dark[400]}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              value={input}
              onChangeText={(text) => {
                setInput(text);
                handleTyping();
              }}
              style={{
                flex: 1,
                backgroundColor: Colors.dark[800],
                borderWidth: 1,
                borderColor: Colors.dark[600],
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: Colors.white,
                fontSize: 15,
                maxHeight: 100,
                fontFamily: isCode ? 'monospace' : undefined,
              }}
              placeholder={isCode ? 'Paste your code here...' : 'Type a message...'}
              placeholderTextColor={Colors.dark[500]}
              multiline
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!input.trim()}
              style={{
                backgroundColor: input.trim() ? Colors.primary[600] : Colors.dark[700],
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
