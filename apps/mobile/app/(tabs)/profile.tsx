import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { profileApi } from '@/services/api';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import TechTag from '@/components/TechTag';
import Avatar from '@/components/Avatar';
import { ROLES, WORK_STYLES, PERSONALITIES, MATCHING_MODES, POPULAR_TECH, POPULAR_TOOLS } from '@/types';

export default function MyProfile() {
  const { profile, setProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (profile) setForm({ ...profile });
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
      Toast.show({ type: 'success', text1: 'Profile updated!' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.detail || 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGithub = async () => {
    setSyncingGithub(true);
    try {
      const { data } = await profileApi.syncGithub();
      setProfile(data);
      Toast.show({ type: 'success', text1: `Synced ${data.github_languages?.length || 0} languages from GitHub!` });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.detail || 'Failed to sync GitHub' });
    } finally {
      setSyncingGithub(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!profile) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button title="Complete Profile Setup" onPress={() => {}} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: Colors.white, fontSize: 24, fontWeight: '700' }}>My Profile</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {editing ? (
              <>
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="sm"
                  onPress={() => { setEditing(false); setForm({ ...profile }); }}
                />
                <Button
                  title={loading ? 'Saving...' : 'Save'}
                  size="sm"
                  onPress={handleSave}
                  loading={loading}
                  icon={<Ionicons name="checkmark" size={16} color={Colors.white} />}
                />
              </>
            ) : (
              <Button title="Edit Profile" size="sm" onPress={() => setEditing(true)} />
            )}
          </View>
        </View>

        {/* About */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>About</Text>
          {editing ? (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Input label="Name" value={form.display_name || ''} onChangeText={(v) => updateForm('display_name', v)} containerStyle={{ flex: 1 }} />
                <Input label="Age" value={String(form.age || 25)} onChangeText={(v) => updateForm('age', parseInt(v) || 0)} keyboardType="number-pad" containerStyle={{ width: 80 }} />
              </View>
              <View>
                <Text style={{ color: Colors.dark[400], fontSize: 14, marginBottom: 4 }}>Bio</Text>
                <TextInput
                  style={{ backgroundColor: Colors.dark[800], borderWidth: 1, borderColor: Colors.dark[600], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: Colors.white, fontSize: 16, height: 100, textAlignVertical: 'top' }}
                  value={form.bio || ''}
                  onChangeText={(v) => updateForm('bio', v)}
                  multiline maxLength={500}
                  placeholderTextColor={Colors.dark[500]}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Input label="City" value={form.city || ''} onChangeText={(v) => updateForm('city', v)} containerStyle={{ flex: 1 }} />
                <Input label="State" value={form.state || ''} onChangeText={(v) => updateForm('state', v)} containerStyle={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name={profile.display_name} size={64} />
                <View>
                  <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '700' }}>
                    {profile.display_name}, {profile.age}
                  </Text>
                  <Text style={{ color: Colors.primary[400], fontSize: 15 }}>{profile.role}</Text>
                  <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
                    {[profile.city, profile.state].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </View>
              {profile.bio && <Text style={{ color: Colors.dark[300], marginTop: 8, lineHeight: 22 }}>{profile.bio}</Text>}
            </View>
          )}
        </Card>

        {/* Professional */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Professional</Text>
          {editing ? (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: Colors.dark[400], fontSize: 14, marginBottom: 8 }}>Role</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {ROLES.map((r) => (
                    <TechTag key={r} label={r} selected={form.role === r} onPress={() => updateForm('role', r)} size="sm" />
                  ))}
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Input label="Experience (years)" value={String(form.years_experience || 0)} onChangeText={(v) => updateForm('years_experience', parseInt(v) || 0)} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
                <Input label="Company" value={form.company || ''} onChangeText={(v) => updateForm('company', v)} containerStyle={{ flex: 1 }} />
              </View>
              <View>
                <Text style={{ color: Colors.dark[400], fontSize: 14, marginBottom: 8 }}>Work Style</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {WORK_STYLES.map((ws) => (
                    <TechTag key={ws} label={ws} selected={form.work_style === ws} onPress={() => updateForm('work_style', ws)} variant="neutral" size="sm" />
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {[
                { label: 'Role', value: profile.role },
                { label: 'Experience', value: `${profile.years_experience} years` },
                { label: 'Work Style', value: profile.work_style },
                profile.company ? { label: 'Company', value: profile.company } : null,
              ].filter(Boolean).map((item) => (
                <View key={item!.label} style={{ width: '45%' }}>
                  <Text style={{ color: Colors.dark[500], fontSize: 14 }}>{item!.label}</Text>
                  <Text style={{ color: Colors.white, fontWeight: '500', fontSize: 15 }}>{item!.value}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Tech Stack */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Tech Stack</Text>
          {editing ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {POPULAR_TECH.map((t) => (
                <TechTag key={t} label={t} selected={(form.tech_stack || []).includes(t)} onPress={() => toggleArrayItem('tech_stack', t)} size="sm" />
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.tech_stack.map((t) => (
                <TechTag key={t} label={t} selected size="sm" />
              ))}
              {profile.tech_stack.length === 0 && (
                <Text style={{ color: Colors.dark[500], fontSize: 14 }}>No tech stack added yet</Text>
              )}
            </View>
          )}
        </Card>

        {/* Favorite Tools */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Favorite Tools</Text>
          {editing ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {POPULAR_TOOLS.map((t) => (
                <TechTag key={t} label={t} selected={(form.favorite_tools || []).includes(t)} onPress={() => toggleArrayItem('favorite_tools', t)} size="sm" variant="accent" />
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.favorite_tools.map((t) => (
                <TechTag key={t} label={t} selected size="sm" variant="accent" />
              ))}
            </View>
          )}
        </Card>

        {/* GitHub */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="logo-github" size={20} color={Colors.white} />
              <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600' }}>GitHub</Text>
            </View>
            {profile.github_url && (
              <Button title={syncingGithub ? 'Syncing...' : 'Sync'} variant="secondary" size="sm" onPress={handleSyncGithub} loading={syncingGithub} />
            )}
          </View>
          {editing ? (
            <Input value={form.github_url || ''} onChangeText={(v) => updateForm('github_url', v)} placeholder="https://github.com/username" autoCapitalize="none" />
          ) : (
            <>
              {profile.github_url && <Text style={{ color: Colors.primary[400], fontSize: 14, marginBottom: 8 }}>{profile.github_url}</Text>}
              {profile.github_languages.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {profile.github_languages.map((l) => (
                    <TechTag key={l} label={l} size="sm" variant="neutral" />
                  ))}
                </View>
              )}
              {profile.github_repos_count != null && (
                <Text style={{ color: Colors.dark[400], fontSize: 14, marginTop: 8 }}>{profile.github_repos_count} public repositories</Text>
              )}
            </>
          )}
        </Card>

        {/* Fun Prompts */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Fun Prompts</Text>
          {editing ? (
            <View style={{ gap: 12 }}>
              {[
                { key: 'prompt_tabs_open', label: '"Tabs open right now..."', color: Colors.primary[300] },
                { key: 'prompt_toxic_trait', label: '"My toxic trait as a developer..."', color: Colors.accent[300] },
                { key: 'prompt_hill_to_die_on', label: '"The hill I\'ll die on in tech..."', color: Colors.green[400] },
              ].map(({ key, label, color }) => (
                <View key={key}>
                  <Text style={{ color, fontSize: 14, marginBottom: 4 }}>{label}</Text>
                  <TextInput
                    style={{ backgroundColor: Colors.dark[800], borderWidth: 1, borderColor: Colors.dark[600], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: Colors.white, fontSize: 16, height: 64, textAlignVertical: 'top' }}
                    value={form[key] || ''}
                    onChangeText={(v) => updateForm(key, v)}
                    multiline
                    placeholderTextColor={Colors.dark[500]}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {[
                { key: 'prompt_tabs_open', label: '"Tabs open right now..."', color: Colors.primary[400] },
                { key: 'prompt_toxic_trait', label: '"My toxic trait as a developer..."', color: Colors.accent[400] },
                { key: 'prompt_hill_to_die_on', label: '"The hill I\'ll die on in tech..."', color: Colors.green[400] },
              ].filter(({ key }) => profile[key as keyof typeof profile]).map(({ key, label, color }) => (
                <View key={key} style={{ backgroundColor: 'rgba(33, 37, 41, 0.5)', borderRadius: 12, padding: 12 }}>
                  <Text style={{ color, fontSize: 12, fontWeight: '500', marginBottom: 4 }}>{label}</Text>
                  <Text style={{ color: Colors.dark[200], fontSize: 14 }}>{profile[key as keyof typeof profile] as string}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Preferences */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Preferences</Text>
          {editing ? (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: Colors.dark[400], fontSize: 14, marginBottom: 8 }}>Personality</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {PERSONALITIES.map((p) => (
                    <TechTag key={p} label={p} selected={form.personality === p} onPress={() => updateForm('personality', p)} variant="accent" size="sm" />
                  ))}
                </View>
              </View>
              <View>
                <Text style={{ color: Colors.dark[400], fontSize: 14, marginBottom: 8 }}>Matching Mode</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {MATCHING_MODES.map((m) => (
                    <TechTag key={m} label={m} selected={form.matching_mode === m} onPress={() => updateForm('matching_mode', m)} size="sm" />
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.dark[500], fontSize: 14 }}>Personality</Text>
                <Text style={{ color: Colors.white, fontWeight: '500' }}>{profile.personality}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.dark[500], fontSize: 14 }}>Looking for</Text>
                <Text style={{ color: Colors.white, fontWeight: '500' }}>{profile.matching_mode}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 16,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.red[400]} />
          <Text style={{ color: Colors.red[400], fontSize: 16, fontWeight: '600' }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}
