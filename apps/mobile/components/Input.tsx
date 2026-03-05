import { TextInput, View, Text, type TextInputProps, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export default function Input({ label, containerStyle, style, ...props }: InputProps) {
  return (
    <View style={containerStyle}>
      {label && (
        <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={Colors.dark[500]}
        style={[
          {
            backgroundColor: Colors.dark[800],
            borderWidth: 1,
            borderColor: Colors.dark[600],
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: Colors.white,
            fontSize: 16,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
