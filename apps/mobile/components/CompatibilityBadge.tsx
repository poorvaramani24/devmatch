import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CompatibilityBadge({ score, size = 'md' }: CompatibilityBadgeProps) {
  const getColors = () => {
    if (score >= 80) return [Colors.green[400], Colors.emerald[500]];
    if (score >= 60) return [Colors.primary[400], Colors.primary[600]];
    if (score >= 40) return [Colors.yellow[400], Colors.orange[500]];
    return [Colors.dark[400], Colors.dark[500]];
  };

  const sizes = {
    sm: { wh: 40, fontSize: 12 },
    md: { wh: 56, fontSize: 14 },
    lg: { wh: 80, fontSize: 18 },
  };

  const s = sizes[size];
  const [color1] = getColors();

  return (
    <View
      style={{
        width: s.wh,
        height: s.wh,
        borderRadius: s.wh / 2,
        backgroundColor: color1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: Colors.white, fontSize: s.fontSize, fontWeight: '700' }}>
        {Math.round(score)}%
      </Text>
    </View>
  );
}
