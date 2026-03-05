import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <View
        style={{
          maxWidth: '75%',
          backgroundColor: isMine ? Colors.primary[600] : Colors.dark[700],
          borderRadius: 16,
          borderBottomRightRadius: isMine ? 4 : 16,
          borderBottomLeftRadius: isMine ? 16 : 4,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        {message.content_type === 'code' ? (
          <View
            style={{
              backgroundColor: 'rgba(33, 37, 41, 0.5)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ color: Colors.dark[200], fontSize: 13, fontFamily: 'monospace' }}>
              {message.content}
            </Text>
          </View>
        ) : (
          <Text style={{ color: isMine ? Colors.white : Colors.dark[100], fontSize: 15 }}>
            {message.content}
          </Text>
        )}
        <Text
          style={{
            color: isMine ? Colors.primary[200] : Colors.dark[500],
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}
