import { SafeAreaView, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SafeScreen({ children, style }: SafeScreenProps) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.dark[900] }, style]}>
      {children}
    </SafeAreaView>
  );
}
