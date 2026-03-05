import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { matchApi } from '@/services/api';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import MatchRow from '@/components/MatchRow';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';
import Button from '@/components/Button';
import type { Match } from '@/types';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data } = await matchApi.getMatches();
      setMatches(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load matches' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <SafeScreen>
        <LoadingSpinner />
      </SafeScreen>
    );
  }

  if (matches.length === 0) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Card style={{ alignItems: 'center' }}>
            <Ionicons name="heart-outline" size={48} color={Colors.dark[500]} style={{ marginBottom: 16 }} />
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
              No matches yet
            </Text>
            <Text style={{ color: Colors.dark[400], textAlign: 'center', marginBottom: 16 }}>
              Keep discovering profiles — your perfect Stack Match is out there!
            </Text>
            <Button title="Go Discover" onPress={() => router.push('/(tabs)')} />
          </Card>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: Colors.white, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Your Matches
        </Text>

        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchRow
              match={item}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
          contentContainerStyle={{ gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary[500]}
            />
          }
        />
      </View>
    </SafeScreen>
  );
}
