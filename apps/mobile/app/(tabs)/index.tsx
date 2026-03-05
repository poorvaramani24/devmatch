import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { discoverApi, matchApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import DiscoverCard from '@/components/DiscoverCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/Card';
import Button from '@/components/Button';
import type { DiscoverProfile } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function Discover() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { profile: myProfile } = useAuth();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data } = await discoverApi.getProfiles();
      setProfiles(data);
      setCurrentIndex(0);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load profiles' });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = useCallback(async (isSuperLike = false) => {
    const profile = profiles[currentIndex];
    if (!profile || actionLoading) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setActionLoading(true);
    try {
      const { data } = await matchApi.likeUser(profile.user_id, isSuperLike);
      if (data.matched) {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Toast.show({
          type: 'success',
          text1: "It's a match!",
          text2: `${Math.round(data.compatibility_score || 0)}% compatible`,
          visibilityTime: 4000,
        });
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.detail || 'Failed to like' });
    } finally {
      setActionLoading(false);
    }
  }, [profiles, currentIndex, actionLoading]);

  const handlePass = useCallback(async () => {
    const profile = profiles[currentIndex];
    if (!profile || actionLoading) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setActionLoading(true);
    try {
      await matchApi.passUser(profile.user_id);
      setCurrentIndex((prev) => prev + 1);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to pass' });
    } finally {
      setActionLoading(false);
    }
  }, [profiles, currentIndex, actionLoading]);

  const onSwipeComplete = useCallback((direction: 'left' | 'right') => {
    if (direction === 'right') {
      handleLike(false);
    } else {
      handlePass();
    }
  }, [handleLike, handlePass]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(onSwipeComplete)(direction);
          translateX.value = 0;
          translateY.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 20}deg` },
    ],
  }));

  if (loading) {
    return (
      <SafeScreen>
        <LoadingSpinner message="Finding your best matches..." />
      </SafeScreen>
    );
  }

  if (!myProfile) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Card style={{ alignItems: 'center' }}>
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
              Complete Your Profile
            </Text>
            <Text style={{ color: Colors.dark[400], textAlign: 'center', marginBottom: 16 }}>
              Set up your profile to start discovering matches.
            </Text>
          </Card>
        </View>
      </SafeScreen>
    );
  }

  const current = profiles[currentIndex];

  if (!current) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Card style={{ alignItems: 'center' }}>
            <Ionicons name="code-slash-outline" size={48} color={Colors.dark[500]} style={{ marginBottom: 16 }} />
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
              No more profiles
            </Text>
            <Text style={{ color: Colors.dark[400], textAlign: 'center', marginBottom: 16 }}>
              You've seen everyone for now. Check back later!
            </Text>
            <Button title="Refresh" onPress={loadProfiles} />
          </Card>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={{ flex: 1, padding: 16 }}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[{ flex: 1 }, cardStyle]}>
            <DiscoverCard profile={current} myProfile={myProfile} />
          </Animated.View>
        </GestureDetector>

        {/* Action buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity
            onPress={handlePass}
            disabled={actionLoading}
            activeOpacity={0.7}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.dark[700],
              borderWidth: 1,
              borderColor: Colors.dark[600],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={24} color={Colors.dark[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleLike(true)}
            disabled={actionLoading}
            activeOpacity={0.7}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: Colors.dark[700],
              borderWidth: 1,
              borderColor: Colors.dark[600],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="star" size={20} color={Colors.blue[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleLike(false)}
            disabled={actionLoading}
            activeOpacity={0.7}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.primary[600],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="heart" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={{ color: Colors.dark[500], fontSize: 12, textAlign: 'center' }}>
          {currentIndex + 1} of {profiles.length} profiles
        </Text>
      </View>
    </SafeScreen>
  );
}
