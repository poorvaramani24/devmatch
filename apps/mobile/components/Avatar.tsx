import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface AvatarProps {
  name: string;
  size?: number;
}

export default function Avatar({ name, size = 56 }: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: Colors.white, fontSize: size * 0.4, fontWeight: '700' }}>
        {name[0]?.toUpperCase() ?? '?'}
      </Text>
    </View>
  );
}
