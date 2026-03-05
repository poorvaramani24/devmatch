import { TouchableOpacity, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: {
    bg: Colors.primary[600],
    text: Colors.white,
    border: Colors.transparent,
  },
  secondary: {
    bg: Colors.dark[700],
    text: Colors.white,
    border: Colors.dark[500],
  },
  accent: {
    bg: Colors.accent[600],
    text: Colors.white,
    border: Colors.transparent,
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  size = 'md',
  icon,
}: ButtonProps) {
  const v = variantStyles[variant];
  const paddingVertical = size === 'sm' ? 8 : 12;
  const paddingHorizontal = size === 'sm' ? 16 : 24;
  const fontSize = size === 'sm' ? 14 : 16;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: 12,
          paddingVertical,
          paddingHorizontal,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.5 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{ color: v.text, fontWeight: '600', fontSize }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
