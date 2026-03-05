import { View, ActivityIndicator, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary[500]} />
      {message && (
        <Text style={{ color: Colors.dark[400], marginTop: 16, fontSize: 14 }}>{message}</Text>
      )}
    </View>
  );
}
