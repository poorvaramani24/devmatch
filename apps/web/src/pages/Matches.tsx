import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchApi } from '../services/api';
import CompatibilityBadge from '../components/CompatibilityBadge';
import toast from 'react-hot-toast';
import { MessageCircle, Heart, Clock } from 'lucide-react';
import type { Match } from '../types';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data } = await matchApi.getMatches();
      setMatches(data);
    } catch {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="card text-center max-w-md">
          <Heart size={48} className="mx-auto text-dark-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">No matches yet</h2>
          <p className="text-dark-400 mb-4">Keep discovering profiles — your perfect Stack Match is out there!</p>
          <button onClick={() => navigate('/discover')} className="btn-primary">Go Discover</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => navigate(`/chat/${match.id}`)}
            className="card flex items-center gap-4 cursor-pointer hover:border-primary-700/50 transition-all duration-200 group"
          >
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {match.other_user.display_name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{match.other_user.display_name}</h3>
                <span className="text-xs text-dark-500">{match.other_user.age}</span>
              </div>
              <p className="text-sm text-primary-400">{match.other_user.role}</p>
              {match.last_message ? (
                <p className="text-sm text-dark-400 truncate mt-0.5">{match.last_message}</p>
              ) : (
                <p className="text-sm text-dark-500 italic mt-0.5">No messages yet — say hello!</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <CompatibilityBadge score={match.compatibility_score} size="sm" />
              {match.unread_count > 0 && (
                <span className="bg-accent-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {match.unread_count}
                </span>
              )}
            </div>

            <MessageCircle size={20} className="text-dark-500 group-hover:text-primary-400 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
