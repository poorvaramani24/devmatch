import { TouchableOpacity, View, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Match } from '@/types';
import Avatar from './Avatar';
import CompatibilityBadge from './CompatibilityBadge';
import { Ionicons } from '@expo/vector-icons';

interface MatchRowProps {
  match: Match;
  onPress: () => void;
}

export default function MatchRow({ match, onPress }: MatchRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: Colors.dark[800],
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.dark[700],
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Avatar name={match.other_user.display_name} size={56} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 16 }}>
            {match.other_user.display_name}
          </Text>
          <Text style={{ color: Colors.dark[500], fontSize: 12 }}>{match.other_user.age}</Text>
        </View>
        <Text style={{ color: Colors.primary[400], fontSize: 14 }}>{match.other_user.role}</Text>
        {match.last_message ? (
          <Text
            numberOfLines={1}
            style={{ color: Colors.dark[400], fontSize: 14, marginTop: 2 }}
          >
            {match.last_message}
          </Text>
        ) : (
          <Text style={{ color: Colors.dark[500], fontSize: 14, fontStyle: 'italic', marginTop: 2 }}>
            No messages yet — say hello!
          </Text>
        )}
      </View>

      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <CompatibilityBadge score={match.compatibility_score} size="sm" />
        {match.unread_count > 0 && (
          <View
            style={{
              backgroundColor: Colors.accent[600],
              borderRadius: 9999,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>
              {match.unread_count}
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chatbubble-outline" size={20} color={Colors.dark[500]} />
    </TouchableOpacity>
  );
}
