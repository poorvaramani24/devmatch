import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchApi, getIcebreakers } from '../services/api';
import { wsService } from '../services/websocket';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Code2, Sparkles, Smile } from 'lucide-react';
import type { Message, Match } from '../types';

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [input, setInput] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const currentMatch = matches.find((m) => m.id === matchId);

  useEffect(() => {
    if (!matchId) return;
    loadMessages();
    loadMatch();
    loadIcebreakers();

    const unsubMessage = wsService.on('message', (data) => {
      if (data.match_id === matchId) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id as string,
            match_id: data.match_id as string,
            sender_id: data.sender_id as string,
            content: data.content as string,
            content_type: data.content_type as string,
            read_at: null,
            created_at: data.created_at as string,
          },
        ]);
      }
    });

    const unsubTyping = wsService.on('typing', (data) => {
      if (data.match_id === matchId && data.user_id !== userId) {
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
    };
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!matchId) return;
    try {
      const { data } = await matchApi.getMessages(matchId);
      setMessages(data);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const loadMatch = async () => {
    try {
      const { data } = await matchApi.getMatches();
      setMatches(data);
    } catch {
      // Ignore
    }
  };

  const loadIcebreakers = async () => {
    try {
      const { data } = await getIcebreakers();
      setIcebreakers(data.prompts);
    } catch {
      // Ignore
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !matchId) return;

    const contentType = isCode ? 'code' : 'text';
    wsService.sendMessage(matchId, input.trim(), contentType);

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        match_id: matchId,
        sender_id: userId!,
        content: input.trim(),
        content_type: contentType,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ]);
    setInput('');
    setIsCode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }

    // Send typing indicator
    if (matchId) {
      wsService.sendTyping(matchId);
    }
  };

  const sendIcebreaker = (prompt: string) => {
    setInput(prompt);
    setShowIcebreakers(false);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 pb-4 border-b border-dark-700 mb-4">
        <button onClick={() => navigate('/matches')} className="text-dark-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        {currentMatch && (
          <>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center font-bold flex-shrink-0">
              {currentMatch.other_user.display_name[0]}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">{currentMatch.other_user.display_name}</h2>
              <p className="text-xs text-dark-400">
                {currentMatch.other_user.role} &middot; {Math.round(currentMatch.compatibility_score)}% match
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles size={32} className="mx-auto text-dark-500 mb-3" />
            <p className="text-dark-400 mb-2">Start the conversation!</p>
            <p className="text-sm text-dark-500">Try an icebreaker below</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-dark-700 text-dark-100 rounded-bl-md'
                }`}
              >
                {msg.content_type === 'code' ? (
                  <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto bg-dark-900/50 rounded-lg p-3 -mx-1">
                    <code>{msg.content}</code>
                  </pre>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-dark-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-dark-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Icebreakers */}
      {showIcebreakers && (
        <div className="border-t border-dark-700 py-3">
          <p className="text-xs text-dark-500 mb-2">Icebreakers</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {icebreakers.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendIcebreaker(prompt)}
                className="text-xs bg-dark-700 hover:bg-dark-600 text-dark-300 px-3 py-1.5 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-dark-700 pt-4 mt-2">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setShowIcebreakers(!showIcebreakers)}
              className={`p-2 rounded-lg transition-colors ${showIcebreakers ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
              title="Icebreakers"
            >
              <Sparkles size={18} />
            </button>
            <button
              onClick={() => setIsCode(!isCode)}
              className={`p-2 rounded-lg transition-colors ${isCode ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
              title="Send code snippet"
            >
              <Code2 size={18} />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`input-field resize-none pr-12 min-h-[44px] max-h-32 ${isCode ? 'font-mono text-sm' : ''}`}
              placeholder={isCode ? 'Paste your code here...' : 'Type a message...'}
              rows={1}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="btn-primary px-3 py-2.5 disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
