import { WS_URL } from '@/constants/api';
import { storage } from './storage';

type MessageHandler = (data: Record<string, unknown>) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  async connect() {
    const token = await storage.getToken();
    if (!token) return;

    this.ws = new WebSocket(`${WS_URL}/ws/chat?token=${token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handlers = this.handlers.get(data.type) || [];
      handlers.forEach((handler) => handler(data));

      const allHandlers = this.handlers.get('*') || [];
      allHandlers.forEach((handler) => handler(data));
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
    this.ws = null;
    this.reconnectAttempts = this.maxReconnectAttempts;
  }

  on(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
    return () => {
      const updated = (this.handlers.get(type) || []).filter((h) => h !== handler);
      this.handlers.set(type, updated);
    };
  }

  sendMessage(matchId: string, content: string, contentType: string = 'text') {
    this.send({
      type: 'message',
      match_id: matchId,
      content,
      content_type: contentType,
    });
  }

  sendTyping(matchId: string) {
    this.send({ type: 'typing', match_id: matchId });
  }

  sendRead(matchId: string, messageId: string) {
    this.send({ type: 'read', match_id: matchId, message_id: messageId });
  }

  private send(data: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsService = new WebSocketService();
