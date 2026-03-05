import { useState, useEffect } from 'react';
import { discoverApi, matchApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CompatibilityBadge from '../components/CompatibilityBadge';
import TechTag from '../components/TechTag';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, MapPin, Briefcase, Code2, Wrench, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DiscoverProfile } from '../types';

export default function Discover() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { profile: myProfile } = useAuth();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data } = await discoverApi.getProfiles();
      setProfiles(data);
    } catch {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (isSuperLike = false) => {
    const profile = profiles[currentIndex];
    if (!profile || actionLoading) return;

    setActionLoading(true);
    try {
      const { data } = await matchApi.likeUser(profile.user_id, isSuperLike);
      if (data.matched) {
        toast.success(`It's a match! ${Math.round(data.compatibility_score || 0)}% compatible`, {
          duration: 4000,
          icon: '💘',
        });
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to like');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    const profile = profiles[currentIndex];
    if (!profile || actionLoading) return;

    setActionLoading(true);
    try {
      await matchApi.passUser(profile.user_id);
      setCurrentIndex((prev) => prev + 1);
    } catch {
      toast.error('Failed to pass');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Finding your best matches...</p>
        </div>
      </div>
    );
  }

  if (!myProfile || myProfile.role === 'Other') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-dark-400 mb-4">Set up your profile to start discovering matches.</p>
          <a href="/setup" className="btn-primary">Complete Setup</a>
        </div>
      </div>
    );
  }

  const current = profiles[currentIndex];

  if (!current) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="card text-center max-w-md">
          <Code2 size={48} className="mx-auto text-dark-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">No more profiles</h2>
          <p className="text-dark-400 mb-4">You've seen everyone for now. Check back later for new developers!</p>
          <button onClick={loadProfiles} className="btn-primary">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="card relative"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{current.display_name}</h2>
                <span className="text-dark-400 text-lg">{current.age}</span>
              </div>
              <p className="text-primary-400 font-medium">{current.role}</p>
              {current.company && (
                <p className="text-dark-400 text-sm flex items-center gap-1 mt-1">
                  <Briefcase size={14} /> {current.company}
                </p>
              )}
              <p className="text-dark-400 text-sm flex items-center gap-1 mt-1">
                <MapPin size={14} /> {[current.city, current.state, current.country].filter(Boolean).join(', ')}
              </p>
            </div>
            <CompatibilityBadge score={current.compatibility_score} size="lg" />
          </div>

          {/* Badges */}
          {current.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {current.badges.map((badge) => (
                <span key={badge} className="tag-accent text-xs">{badge}</span>
              ))}
            </div>
          )}

          {/* Bio */}
          {current.bio && (
            <p className="text-dark-300 mb-4 leading-relaxed">{current.bio}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-900/50 rounded-xl p-3">
              <p className="text-xs text-dark-500 mb-1">Experience</p>
              <p className="font-medium">{current.years_experience} years</p>
            </div>
            <div className="bg-dark-900/50 rounded-xl p-3">
              <p className="text-xs text-dark-500 mb-1">Work Style</p>
              <p className="font-medium">{current.work_style}</p>
            </div>
            <div className="bg-dark-900/50 rounded-xl p-3">
              <p className="text-xs text-dark-500 mb-1">Personality</p>
              <p className="font-medium">{current.personality}</p>
            </div>
            <div className="bg-dark-900/50 rounded-xl p-3">
              <p className="text-xs text-dark-500 mb-1">Looking for</p>
              <p className="font-medium text-sm">{current.matching_mode}</p>
            </div>
          </div>

          {/* Tech Stack */}
          {current.tech_stack.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-1">
                <Code2 size={14} /> Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {current.tech_stack.map((t) => (
                  <TechTag key={t} label={t} size="sm" selected={myProfile?.tech_stack?.includes(t)} />
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {current.favorite_tools.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-1">
                <Wrench size={14} /> Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {current.favorite_tools.map((t) => (
                  <TechTag key={t} label={t} size="sm" variant="accent" selected={myProfile?.favorite_tools?.includes(t)} />
                ))}
              </div>
            </div>
          )}

          {/* GitHub Languages */}
          {current.github_languages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-1">
                <Github size={14} /> GitHub Languages
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {current.github_languages.map((l) => (
                  <TechTag key={l} label={l} size="sm" variant="neutral" />
                ))}
              </div>
            </div>
          )}

          {/* Fun Prompts */}
          {current.prompt_tabs_open && (
            <div className="bg-dark-900/50 rounded-xl p-4 mb-3">
              <p className="text-xs text-primary-400 font-medium mb-1">"Tabs open right now..."</p>
              <p className="text-dark-200 text-sm">{current.prompt_tabs_open}</p>
            </div>
          )}
          {current.prompt_toxic_trait && (
            <div className="bg-dark-900/50 rounded-xl p-4 mb-3">
              <p className="text-xs text-accent-400 font-medium mb-1">"My toxic trait as a developer..."</p>
              <p className="text-dark-200 text-sm">{current.prompt_toxic_trait}</p>
            </div>
          )}
          {current.prompt_hill_to_die_on && (
            <div className="bg-dark-900/50 rounded-xl p-4 mb-3">
              <p className="text-xs text-green-400 font-medium mb-1">"The hill I'll die on in tech..."</p>
              <p className="text-dark-200 text-sm">{current.prompt_hill_to_die_on}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handlePass}
              disabled={actionLoading}
              className="w-14 h-14 rounded-full bg-dark-700 hover:bg-red-900/50 border border-dark-600 hover:border-red-500/50 flex items-center justify-center transition-all duration-200 group"
            >
              <X size={24} className="text-dark-400 group-hover:text-red-400" />
            </button>

            <button
              onClick={() => handleLike(true)}
              disabled={actionLoading}
              className="w-12 h-12 rounded-full bg-dark-700 hover:bg-blue-900/50 border border-dark-600 hover:border-blue-500/50 flex items-center justify-center transition-all duration-200 group"
            >
              <Star size={20} className="text-dark-400 group-hover:text-blue-400" />
            </button>

            <button
              onClick={() => handleLike(false)}
              disabled={actionLoading}
              className="w-14 h-14 rounded-full bg-primary-600 hover:bg-accent-600 flex items-center justify-center transition-all duration-200 shadow-lg shadow-primary-600/20 hover:shadow-accent-600/20"
            >
              <Heart size={24} className="text-white" />
            </button>
          </div>

          {/* Counter */}
          <p className="text-center text-xs text-dark-500 mt-4">
            {currentIndex + 1} of {profiles.length} profiles
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
