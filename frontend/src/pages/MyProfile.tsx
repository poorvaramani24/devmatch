import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileApi } from '../services/api';
import TechTag from '../components/TechTag';
import toast from 'react-hot-toast';
import { ROLES, WORK_STYLES, PERSONALITIES, MATCHING_MODES, POPULAR_TECH, POPULAR_TOOLS } from '../types';
import { Save, Github, RefreshCw } from 'lucide-react';

export default function MyProfile() {
  const { profile, setProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (profile) {
      setForm({ ...profile });
    }
  }, [profile]);

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setForm((prev) => {
      const arr = (prev[field] as string[]) || [];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((i: string) => i !== item) : [...arr, item],
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await profileApi.updateProfile(form);
      setProfile(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGithub = async () => {
    setSyncingGithub(true);
    try {
      const { data } = await profileApi.syncGithub();
      setProfile(data);
      toast.success(`Synced ${data.github_languages?.length || 0} languages from GitHub!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to sync GitHub');
    } finally {
      setSyncingGithub(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <a href="/setup" className="btn-primary">Complete Profile Setup</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setForm({ ...profile }); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary text-sm flex items-center gap-1">
                <Save size={16} /> {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-primary text-sm">Edit Profile</button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Name</label>
                  <input className="input-field" value={form.display_name || ''} onChange={(e) => updateForm('display_name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Age</label>
                  <input className="input-field" type="number" value={form.age || 25} onChange={(e) => updateForm('age', parseInt(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">Bio</label>
                <textarea className="input-field h-24 resize-none" value={form.bio || ''} onChange={(e) => updateForm('bio', e.target.value)} maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">City</label>
                  <input className="input-field" value={form.city || ''} onChange={(e) => updateForm('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">State</label>
                  <input className="input-field" value={form.state || ''} onChange={(e) => updateForm('state', e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-2xl font-bold">
                  {profile.display_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile.display_name}, {profile.age}</h3>
                  <p className="text-primary-400">{profile.role}</p>
                  <p className="text-sm text-dark-400">{[profile.city, profile.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              {profile.bio && <p className="text-dark-300 mt-2">{profile.bio}</p>}
            </div>
          )}
        </div>

        {/* Professional */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Professional</h2>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Role</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <TechTag key={r} label={r} selected={form.role === r} onClick={() => updateForm('role', r)} size="sm" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Experience (years)</label>
                  <input className="input-field" type="number" value={form.years_experience || 0} onChange={(e) => updateForm('years_experience', parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Company</label>
                  <input className="input-field" value={form.company || ''} onChange={(e) => updateForm('company', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Work Style</label>
                <div className="flex gap-2">
                  {WORK_STYLES.map((ws) => (
                    <TechTag key={ws} label={ws} selected={form.work_style === ws} onClick={() => updateForm('work_style', ws)} variant="neutral" size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-dark-500">Role</span><p className="font-medium">{profile.role}</p></div>
              <div><span className="text-sm text-dark-500">Experience</span><p className="font-medium">{profile.years_experience} years</p></div>
              <div><span className="text-sm text-dark-500">Work Style</span><p className="font-medium">{profile.work_style}</p></div>
              {profile.company && <div><span className="text-sm text-dark-500">Company</span><p className="font-medium">{profile.company}</p></div>}
            </div>
          )}
        </div>

        {/* Tech Stack */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Tech Stack</h2>
          {editing ? (
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TECH.map((t) => (
                <TechTag key={t} label={t} selected={(form.tech_stack || []).includes(t)} onClick={() => toggleArrayItem('tech_stack', t)} size="sm" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {profile.tech_stack.map((t) => (
                <TechTag key={t} label={t} selected size="sm" />
              ))}
              {profile.tech_stack.length === 0 && <p className="text-dark-500 text-sm">No tech stack added yet</p>}
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Favorite Tools</h2>
          {editing ? (
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TOOLS.map((t) => (
                <TechTag key={t} label={t} selected={(form.favorite_tools || []).includes(t)} onClick={() => toggleArrayItem('favorite_tools', t)} size="sm" variant="accent" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {profile.favorite_tools.map((t) => (
                <TechTag key={t} label={t} selected size="sm" variant="accent" />
              ))}
            </div>
          )}
        </div>

        {/* GitHub */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Github size={20} /> GitHub</h2>
            {profile.github_url && (
              <button onClick={handleSyncGithub} disabled={syncingGithub} className="btn-secondary text-sm flex items-center gap-1">
                <RefreshCw size={14} className={syncingGithub ? 'animate-spin' : ''} />
                {syncingGithub ? 'Syncing...' : 'Sync'}
              </button>
            )}
          </div>
          {editing ? (
            <input className="input-field" value={form.github_url || ''} onChange={(e) => updateForm('github_url', e.target.value)} placeholder="https://github.com/username" />
          ) : (
            <>
              {profile.github_url && <p className="text-primary-400 text-sm mb-2">{profile.github_url}</p>}
              {profile.github_languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.github_languages.map((l) => (
                    <TechTag key={l} label={l} size="sm" variant="neutral" />
                  ))}
                </div>
              )}
              {profile.github_repos_count != null && (
                <p className="text-sm text-dark-400 mt-2">{profile.github_repos_count} public repositories</p>
              )}
            </>
          )}
        </div>

        {/* Fun Prompts */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Fun Prompts</h2>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-primary-300">"Tabs open right now..."</label>
                <textarea className="input-field h-16 resize-none mt-1" value={form.prompt_tabs_open || ''} onChange={(e) => updateForm('prompt_tabs_open', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-accent-300">"My toxic trait as a developer..."</label>
                <textarea className="input-field h-16 resize-none mt-1" value={form.prompt_toxic_trait || ''} onChange={(e) => updateForm('prompt_toxic_trait', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-green-300">"The hill I'll die on in tech..."</label>
                <textarea className="input-field h-16 resize-none mt-1" value={form.prompt_hill_to_die_on || ''} onChange={(e) => updateForm('prompt_hill_to_die_on', e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.prompt_tabs_open && (
                <div className="bg-dark-900/50 rounded-xl p-3">
                  <p className="text-xs text-primary-400 font-medium mb-1">"Tabs open right now..."</p>
                  <p className="text-sm text-dark-200">{profile.prompt_tabs_open}</p>
                </div>
              )}
              {profile.prompt_toxic_trait && (
                <div className="bg-dark-900/50 rounded-xl p-3">
                  <p className="text-xs text-accent-400 font-medium mb-1">"My toxic trait as a developer..."</p>
                  <p className="text-sm text-dark-200">{profile.prompt_toxic_trait}</p>
                </div>
              )}
              {profile.prompt_hill_to_die_on && (
                <div className="bg-dark-900/50 rounded-xl p-3">
                  <p className="text-xs text-green-400 font-medium mb-1">"The hill I'll die on in tech..."</p>
                  <p className="text-sm text-dark-200">{profile.prompt_hill_to_die_on}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Personality</label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITIES.map((p) => (
                    <TechTag key={p} label={p} selected={form.personality === p} onClick={() => updateForm('personality', p)} variant="accent" size="sm" />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Matching Mode</label>
                <div className="flex flex-wrap gap-2">
                  {MATCHING_MODES.map((m) => (
                    <TechTag key={m} label={m} selected={form.matching_mode === m} onClick={() => updateForm('matching_mode', m)} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-dark-500">Personality</span><p className="font-medium">{profile.personality}</p></div>
              <div><span className="text-sm text-dark-500">Looking for</span><p className="font-medium">{profile.matching_mode}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
