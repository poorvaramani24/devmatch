import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { profileApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import TechTag from '@/components/TechTag';
import ProgressBar from '@/components/ProgressBar';
import {
  ROLES, WORK_STYLES, PERSONALITIES, MATCHING_MODES,
  GENDERS, POPULAR_TECH, POPULAR_TOOLS,
} from '@/types';

export default function ProfileSetup() {
  const router = useRouter();
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
      Toast.show({ type: 'success', text1: 'Profile created! Start discovering matches.' });
      router.replace('/(tabs)');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.detail || 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.primary[400], fontFamily: 'monospace' }}>
              {'<DevMatch />'}
            </Text>
            <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '700', marginTop: 16 }}>
              Set up your profile
            </Text>
            <Text style={{ color: Colors.dark[400], marginTop: 4 }}>
              Step {step} of {totalSteps}
            </Text>
            <View style={{ width: '100%', marginTop: 16 }}>
              <ProgressBar progress={step / totalSteps} />
            </View>
          </View>

          <Card>
            {/* Step 1: Basics */}
            {step === 1 && (
              <View style={{ gap: 16 }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                  The basics
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Input
                    label="Display Name"
                    value={form.display_name}
                    onChangeText={(v) => updateForm('display_name', v)}
                    placeholder="Your name"
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="Age"
                    value={String(form.age)}
                    onChangeText={(v) => updateForm('age', parseInt(v) || 0)}
                    keyboardType="number-pad"
                    containerStyle={{ width: 80 }}
                  />
                </View>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Gender
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {GENDERS.map((g) => (
                      <TechTag
                        key={g}
                        label={g}
                        selected={form.gender === g}
                        onPress={() => updateForm('gender', g)}
                        variant="neutral"
                      />
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Interested in
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {GENDERS.filter((g) => g !== 'Prefer not to say').map((g) => (
                      <TechTag
                        key={g}
                        label={g}
                        selected={form.looking_for.includes(g)}
                        onPress={() => toggleArrayItem('looking_for', g)}
                        variant="accent"
                      />
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Input
                    label="City"
                    value={form.city}
                    onChangeText={(v) => updateForm('city', v)}
                    placeholder="San Francisco"
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="State"
                    value={form.state}
                    onChangeText={(v) => updateForm('state', v)}
                    placeholder="California"
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* Step 2: Professional */}
            {step === 2 && (
              <View style={{ gap: 16 }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                  Your tech life
                </Text>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Role
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {ROLES.map((r) => (
                      <TechTag key={r} label={r} selected={form.role === r} onPress={() => updateForm('role', r)} />
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Input
                    label="Years of Experience"
                    value={String(form.years_experience)}
                    onChangeText={(v) => updateForm('years_experience', parseInt(v) || 0)}
                    keyboardType="number-pad"
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="Company (optional)"
                    value={form.company}
                    onChangeText={(v) => updateForm('company', v)}
                    placeholder="Where you work"
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Work Style
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {WORK_STYLES.map((ws) => (
                      <TechTag
                        key={ws}
                        label={ws}
                        selected={form.work_style === ws}
                        onPress={() => updateForm('work_style', ws)}
                        variant="neutral"
                      />
                    ))}
                  </View>
                </View>

                <Input
                  label="GitHub URL (optional)"
                  value={form.github_url}
                  onChangeText={(v) => updateForm('github_url', v)}
                  placeholder="https://github.com/yourusername"
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Step 3: Tech Stack */}
            {step === 3 && (
              <View style={{ gap: 16 }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '600' }}>
                  Your tech stack
                </Text>
                <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
                  Select all technologies you work with (this powers your Stack Match %)
                </Text>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Technologies ({form.tech_stack.length} selected)
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {POPULAR_TECH.map((t) => (
                      <TechTag
                        key={t}
                        label={t}
                        selected={form.tech_stack.includes(t)}
                        onPress={() => toggleArrayItem('tech_stack', t)}
                      />
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Favorite Tools ({form.favorite_tools.length} selected)
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {POPULAR_TOOLS.map((t) => (
                      <TechTag
                        key={t}
                        label={t}
                        selected={form.favorite_tools.includes(t)}
                        onPress={() => toggleArrayItem('favorite_tools', t)}
                        variant="accent"
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Step 4: Personality */}
            {step === 4 && (
              <View style={{ gap: 16 }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                  Your vibe
                </Text>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Personality
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {PERSONALITIES.map((p) => (
                      <TechTag
                        key={p}
                        label={p}
                        selected={form.personality === p}
                        onPress={() => updateForm('personality', p)}
                        variant="accent"
                      />
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                    Looking for
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {MATCHING_MODES.map((m) => (
                      <TechTag
                        key={m}
                        label={m}
                        selected={form.matching_mode === m}
                        onPress={() => updateForm('matching_mode', m)}
                      />
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={{ color: Colors.dark[300], fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                    Bio
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: Colors.dark[800],
                      borderWidth: 1,
                      borderColor: Colors.dark[600],
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: Colors.white,
                      fontSize: 16,
                      height: 100,
                      textAlignVertical: 'top',
                    }}
                    value={form.bio}
                    onChangeText={(v) => updateForm('bio', v)}
                    placeholder="Tell potential matches about yourself..."
                    placeholderTextColor={Colors.dark[500]}
                    multiline
                    maxLength={500}
                  />
                  <Text style={{ color: Colors.dark[500], fontSize: 12, marginTop: 4 }}>
                    {form.bio.length}/500
                  </Text>
                </View>
              </View>
            )}

            {/* Step 5: Fun Prompts */}
            {step === 5 && (
              <View style={{ gap: 16 }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '600' }}>
                  Fun prompts
                </Text>
                <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
                  These show up on your profile and make great conversation starters.
                </Text>

                <View>
                  <Text style={{ color: Colors.primary[300], fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                    "Tabs open right now..."
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: Colors.dark[800],
                      borderWidth: 1,
                      borderColor: Colors.dark[600],
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: Colors.white,
                      fontSize: 16,
                      height: 80,
                      textAlignVertical: 'top',
                    }}
                    value={form.prompt_tabs_open}
                    onChangeText={(v) => updateForm('prompt_tabs_open', v)}
                    placeholder="Stack Overflow, that one bug I've been chasing..."
                    placeholderTextColor={Colors.dark[500]}
                    multiline
                    maxLength={300}
                  />
                </View>

                <View>
                  <Text style={{ color: Colors.accent[300], fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                    "My toxic trait as a developer..."
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: Colors.dark[800],
                      borderWidth: 1,
                      borderColor: Colors.dark[600],
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: Colors.white,
                      fontSize: 16,
                      height: 80,
                      textAlignVertical: 'top',
                    }}
                    value={form.prompt_toxic_trait}
                    onChangeText={(v) => updateForm('prompt_toxic_trait', v)}
                    placeholder="I refactor perfectly working code at 2 AM"
                    placeholderTextColor={Colors.dark[500]}
                    multiline
                    maxLength={300}
                  />
                </View>

                <View>
                  <Text style={{ color: Colors.green[400], fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                    "The hill I'll die on in tech..."
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: Colors.dark[800],
                      borderWidth: 1,
                      borderColor: Colors.dark[600],
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: Colors.white,
                      fontSize: 16,
                      height: 80,
                      textAlignVertical: 'top',
                    }}
                    value={form.prompt_hill_to_die_on}
                    onChangeText={(v) => updateForm('prompt_hill_to_die_on', v)}
                    placeholder="Tabs are objectively superior to spaces."
                    placeholderTextColor={Colors.dark[500]}
                    multiline
                    maxLength={300}
                  />
                </View>
              </View>
            )}

            {/* Navigation */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 }}>
              <Button
                title="Back"
                onPress={() => setStep(Math.max(1, step - 1))}
                variant="secondary"
                disabled={step === 1}
              />
              {step < totalSteps ? (
                <Button title="Continue" onPress={() => setStep(step + 1)} />
              ) : (
                <Button
                  title={loading ? 'Saving...' : 'Complete Setup'}
                  onPress={handleSubmit}
                  variant="accent"
                  loading={loading}
                />
              )}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
