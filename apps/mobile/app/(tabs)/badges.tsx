import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { badgeApi } from '@/services/api';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressBar from '@/components/ProgressBar';
import type { Badge, BadgeInfo } from '@/types';

const BADGE_ICONS: Record<string, string> = {
  'Bug Slayer': '\u{1F41B}',
  'Refactor Master': '\u267B\uFE0F',
  'CI/CD Champion': '\u{1F680}',
  'Open Source Contributor': '\u{1F31F}',
  'Stack Overflow Hero': '\u{1F4DA}',
  'Polyglot Developer': '\u{1F5E3}\uFE0F',
  'Early Adopter': '\u{1F3C5}',
  'Conversation Starter': '\u{1F4AC}',
  'Profile Complete': '\u2705',
  'First Match': '\u{1F498}',
  'Super Liker': '\u2B50',
  'Senior Dev Mode': '\u{1F468}\u200D\u{1F4BB}',
};

const BADGE_DESCRIPTIONS: Record<string, string> = {
  'Bug Slayer': 'Squashed bugs like a pro',
  'Refactor Master': 'Clean code enthusiast',
  'CI/CD Champion': 'Pipeline perfectionist',
  'Open Source Contributor': '5+ public repositories on GitHub',
  'Stack Overflow Hero': 'Active Stack Overflow contributor',
  'Polyglot Developer': 'Proficient in 5+ technologies',
  'Early Adopter': 'Joined DevMatch early',
  'Conversation Starter': 'Sent 10+ messages',
  'Profile Complete': 'Filled out your entire profile',
  'First Match': 'Got your first match!',
  'Super Liker': 'Used a super like',
  'Senior Dev Mode': '10+ years of experience',
};

export default function Badges() {
  const [myBadges, setMyBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        badgeApi.getMyBadges(),
        badgeApi.getAllBadgeInfo(),
      ]);
      setMyBadges(myRes.data);
      setAllBadges(allRes.data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load badges' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  }, []);

  const earnedTypes = new Set(myBadges.map((b) => b.badge_type));
  const allBadgeTypes = Object.keys(BADGE_ICONS);

  if (loading) {
    return (
      <SafeScreen>
        <LoadingSpinner />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Ionicons name="trophy" size={28} color={Colors.yellow[400]} />
          <View>
            <Text style={{ color: Colors.white, fontSize: 24, fontWeight: '700' }}>Badges</Text>
            <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
              {myBadges.length} of {allBadgeTypes.length} earned
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ marginBottom: 32 }}>
          <ProgressBar
            progress={myBadges.length / allBadgeTypes.length}
            colors={[Colors.yellow[400], Colors.yellow[600]]}
            height={12}
          />
        </View>

        {/* Earned badges */}
        {myBadges.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: Colors.yellow[400], fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
              Earned
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {myBadges.map((badge) => (
                <View
                  key={badge.id}
                  style={{
                    width: '47%',
                    backgroundColor: 'rgba(120, 80, 0, 0.1)',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(120, 80, 0, 0.3)',
                    padding: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>
                    {BADGE_ICONS[badge.badge_type] || '\u{1F3C6}'}
                  </Text>
                  <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14, textAlign: 'center' }}>
                    {badge.badge_type}
                  </Text>
                  <Text style={{ color: Colors.dark[400], fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    {BADGE_DESCRIPTIONS[badge.badge_type]}
                  </Text>
                  <Text style={{ color: Colors.dark[500], fontSize: 12, marginTop: 8 }}>
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Locked badges */}
        <View>
          <Text style={{ color: Colors.dark[500], fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
            Locked
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {allBadgeTypes
              .filter((type) => !earnedTypes.has(type))
              .map((type) => (
                <View
                  key={type}
                  style={{
                    width: '47%',
                    backgroundColor: Colors.dark[800],
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.dark[700],
                    padding: 16,
                    alignItems: 'center',
                    opacity: 0.5,
                  }}
                >
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>
                    {BADGE_ICONS[type] || '\u{1F3C6}'}
                  </Text>
                  <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14, textAlign: 'center' }}>
                    {type}
                  </Text>
                  <Text style={{ color: Colors.dark[500], fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    {BADGE_DESCRIPTIONS[type]}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
