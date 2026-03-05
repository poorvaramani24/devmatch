import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface IcebreakerChipsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export default function IcebreakerChips({ prompts, onSelect }: IcebreakerChipsProps) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: Colors.dark[700], paddingVertical: 12 }}>
      <Text style={{ color: Colors.dark[500], fontSize: 12, marginBottom: 8, paddingHorizontal: 4 }}>
        Icebreakers
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {prompts.map((prompt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSelect(prompt)}
            activeOpacity={0.7}
            style={{
              backgroundColor: Colors.dark[700],
              borderRadius: 9999,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: Colors.dark[300], fontSize: 13 }}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
