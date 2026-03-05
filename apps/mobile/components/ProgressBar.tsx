import { View } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  colors?: [string, string];
}

export default function ProgressBar({
  progress,
  height = 8,
  colors = [Colors.primary[500], Colors.accent[500]],
}: ProgressBarProps) {
  return (
    <View style={{ width: '100%', height, backgroundColor: Colors.dark[700], borderRadius: height / 2 }}>
      <View
        style={{
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
          height,
          backgroundColor: colors[0],
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
