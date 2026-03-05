import { View, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.dark[800],
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.dark[700],
          padding: 24,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
