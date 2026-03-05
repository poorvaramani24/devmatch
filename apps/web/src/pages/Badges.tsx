import { useState, useEffect } from 'react';
import { badgeApi } from '../services/api';
import toast from 'react-hot-toast';
import type { Badge, BadgeInfo } from '../types';
import { Trophy } from 'lucide-react';

const BADGE_ICONS: Record<string, string> = {
  'Bug Slayer': '🐛',
  'Refactor Master': '♻️',
  'CI/CD Champion': '🚀',
  'Open Source Contributor': '🌟',
  'Stack Overflow Hero': '📚',
  'Polyglot Developer': '🗣️',
  'Early Adopter': '🏅',
  'Conversation Starter': '💬',
  'Profile Complete': '✅',
  'First Match': '💘',
  'Super Liker': '⭐',
  'Senior Dev Mode': '👨‍💻',
};

const BADGE_DESCRIPTIONS: Record<string, string> = {
  'Bug Slayer': 'Squashed bugs like a pro',
  'Refactor Master': 'Clean code enthusiast',
  'CI/CD Champion': 'Pipeline perfectionist',
  'Open Source Contributor': '5+ public repositories on GitHub',
  'Stack Overflow Hero': 'Active Stack Overflow contributor',
  'Polyglot Developer': 'Proficient in 5+ technologies',
  'Early Adopter': 'Joined DevMatch early',
  'Conversation Starter': 'Sent 10+ messages',
  'Profile Complete': 'Filled out your entire profile',
  'First Match': 'Got your first match!',
  'Super Liker': 'Used a super like',
  'Senior Dev Mode': '10+ years of experience',
};

export default function Badges() {
  const [myBadges, setMyBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        badgeApi.getMyBadges(),
        badgeApi.getAllBadgeInfo(),
      ]);
      setMyBadges(myRes.data);
      setAllBadges(allRes.data);
    } catch {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const earnedTypes = new Set(myBadges.map((b) => b.badge_type));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // All possible badges
  const allBadgeTypes = Object.keys(BADGE_ICONS);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={28} className="text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold">Badges</h1>
          <p className="text-dark-400 text-sm">{myBadges.length} of {allBadgeTypes.length} earned</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-dark-700 rounded-full h-3 mb-8">
        <div
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(myBadges.length / allBadgeTypes.length) * 100}%` }}
        />
      </div>

      {/* Earned badges */}
      {myBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">Earned</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myBadges.map((badge) => (
              <div key={badge.id} className="card text-center border-yellow-700/30 bg-yellow-900/10">
                <div className="text-4xl mb-2">{BADGE_ICONS[badge.badge_type] || '🏆'}</div>
                <h3 className="font-semibold text-sm">{badge.badge_type}</h3>
                <p className="text-xs text-dark-400 mt-1">{BADGE_DESCRIPTIONS[badge.badge_type]}</p>
                <p className="text-xs text-dark-500 mt-2">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-dark-500">Locked</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadgeTypes
            .filter((type) => !earnedTypes.has(type))
            .map((type) => (
              <div key={type} className="card text-center opacity-50">
                <div className="text-4xl mb-2 grayscale">{BADGE_ICONS[type] || '🏆'}</div>
                <h3 className="font-semibold text-sm">{type}</h3>
                <p className="text-xs text-dark-500 mt-1">{BADGE_DESCRIPTIONS[type]}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
