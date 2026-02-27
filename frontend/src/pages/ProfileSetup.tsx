import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TechTag from '../components/TechTag';
import toast from 'react-hot-toast';
import { ROLES, WORK_STYLES, PERSONALITIES, MATCHING_MODES, GENDERS, POPULAR_TECH, POPULAR_TOOLS } from '../types';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { setProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    display_name: '',
    age: 25,
    gender: '',
    looking_for: [] as string[],
    bio: '',
    city: '',
    state: '',
    country: 'United States',
    role: '',
    years_experience: 0,
    company: '',
    tech_stack: [] as string[],
    favorite_tools: [] as string[],
    work_style: 'Remote',
    github_url: '',
    linkedin_url: '',
    personality: 'Ambivert',
    hobbies: [] as string[],
    matching_mode: 'Serious Relationship',
    prompt_tabs_open: '',
    prompt_toxic_trait: '',
    prompt_hill_to_die_on: '',
  });

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setForm((prev) => {
      const arr = (prev as any)[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await profileApi.setupProfile(form);
      setProfile(data);
      toast.success('Profile created! Start discovering matches.');
      navigate('/discover');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold gradient-text font-mono">&lt;DevMatch /&gt;</span>
          <h1 className="text-2xl font-bold mt-4">Set up your profile</h1>
          <p className="text-dark-400 mt-1">Step {step} of {totalSteps}</p>
          {/* Progress bar */}
          <div className="w-full bg-dark-700 rounded-full h-2 mt-4">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="card">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">The basics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-dark-300 mb-1">Display Name</label>
                  <input className="input-field" value={form.display_name} onChange={(e) => updateForm('display_name', e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Age</label>
                  <input className="input-field" type="number" min={18} max={99} value={form.age} onChange={(e) => updateForm('age', parseInt(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <TechTag key={g} label={g} selected={form.gender === g} onClick={() => updateForm('gender', g)} variant="neutral" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Interested in</label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.filter((g) => g !== 'Prefer not to say').map((g) => (
                    <TechTag key={g} label={g} selected={form.looking_for.includes(g)} onClick={() => toggleArrayItem('looking_for', g)} variant="accent" />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">City</label>
                  <input className="input-field" value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="San Francisco" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">State</label>
                  <input className="input-field" value={form.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="California" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Your tech life</h2>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Role</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <TechTag key={r} label={r} selected={form.role === r} onClick={() => updateForm('role', r)} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Years of Experience</label>
                  <input className="input-field" type="number" min={0} max={50} value={form.years_experience} onChange={(e) => updateForm('years_experience', parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Company (optional)</label>
                  <input className="input-field" value={form.company} onChange={(e) => updateForm('company', e.target.value)} placeholder="Where you work" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Work Style</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_STYLES.map((ws) => (
                    <TechTag key={ws} label={ws} selected={form.work_style === ws} onClick={() => updateForm('work_style', ws)} variant="neutral" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">GitHub URL (optional)</label>
                <input className="input-field" value={form.github_url} onChange={(e) => updateForm('github_url', e.target.value)} placeholder="https://github.com/yourusername" />
              </div>
            </div>
          )}

          {/* Step 3: Tech Stack */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Your tech stack</h2>
              <p className="text-sm text-dark-400 mb-4">Select all technologies you work with (this powers your Stack Match %)</p>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Technologies ({form.tech_stack.length} selected)</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TECH.map((t) => (
                    <TechTag key={t} label={t} selected={form.tech_stack.includes(t)} onClick={() => toggleArrayItem('tech_stack', t)} />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-dark-300 mb-2">Favorite Tools ({form.favorite_tools.length} selected)</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TOOLS.map((t) => (
                    <TechTag key={t} label={t} selected={form.favorite_tools.includes(t)} onClick={() => toggleArrayItem('favorite_tools', t)} variant="accent" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Personality */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Your vibe</h2>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Personality</label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITIES.map((p) => (
                    <TechTag key={p} label={p} selected={form.personality === p} onClick={() => updateForm('personality', p)} variant="accent" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Looking for</label>
                <div className="flex flex-wrap gap-2">
                  {MATCHING_MODES.map((m) => (
                    <TechTag key={m} label={m} selected={form.matching_mode === m} onClick={() => updateForm('matching_mode', m)} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Bio</label>
                <textarea
                  className="input-field h-24 resize-none"
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  placeholder="Tell potential matches about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-dark-500 mt-1">{form.bio.length}/500</p>
              </div>
            </div>
          )}

          {/* Step 5: Fun Prompts */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Fun prompts</h2>
              <p className="text-sm text-dark-400 mb-4">These show up on your profile and make great conversation starters.</p>

              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">"Tabs open right now..."</label>
                <textarea
                  className="input-field h-20 resize-none"
                  value={form.prompt_tabs_open}
                  onChange={(e) => updateForm('prompt_tabs_open', e.target.value)}
                  placeholder="Stack Overflow, that one bug I've been chasing for 3 days, and a recipe for pad thai"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-1">"My toxic trait as a developer..."</label>
                <textarea
                  className="input-field h-20 resize-none"
                  value={form.prompt_toxic_trait}
                  onChange={(e) => updateForm('prompt_toxic_trait', e.target.value)}
                  placeholder="I refactor perfectly working code at 2 AM"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-1">"The hill I'll die on in tech..."</label>
                <textarea
                  className="input-field h-20 resize-none"
                  value={form.prompt_hill_to_die_on}
                  onChange={(e) => updateForm('prompt_hill_to_die_on', e.target.value)}
                  placeholder="Tabs are objectively superior to spaces. Fight me."
                  maxLength={300}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              className="btn-secondary"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </button>

            {step < totalSteps ? (
              <button className="btn-primary" onClick={() => setStep(step + 1)}>
                Continue
              </button>
            ) : (
              <button className="btn-accent" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
