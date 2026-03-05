import { TouchableOpacity, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface TechTagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'neutral';
  size?: 'sm' | 'md';
}

export default function TechTag({ label, selected, onPress, variant = 'primary', size = 'md' }: TechTagProps) {
  const getColors = () => {
    if (variant === 'primary') {
      return selected
        ? { bg: Colors.primary[600], text: Colors.white, border: Colors.primary[500] }
        : { bg: 'rgba(54, 79, 199, 0.3)', text: Colors.primary[300], border: 'rgba(66, 99, 235, 0.3)' };
    }
    if (variant === 'accent') {
      return selected
        ? { bg: Colors.accent[600], text: Colors.white, border: Colors.accent[500] }
        : { bg: 'rgba(166, 30, 77, 0.3)', text: Colors.accent[300], border: 'rgba(214, 51, 108, 0.3)' };
    }
    return selected
      ? { bg: Colors.dark[600], text: Colors.white, border: Colors.dark[500] }
      : { bg: Colors.dark[800], text: Colors.dark[300], border: Colors.dark[600] };
  };

  const colors = getColors();
  const paddingH = size === 'sm' ? 10 : 12;
  const paddingV = size === 'sm' ? 4 : 6;
  const fontSize = size === 'sm' ? 12 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: colors.bg,
        borderRadius: 9999,
        paddingHorizontal: paddingH,
        paddingVertical: paddingV,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontSize, fontWeight: '500' }}>{label}</Text>
    </TouchableOpacity>
  );
}
