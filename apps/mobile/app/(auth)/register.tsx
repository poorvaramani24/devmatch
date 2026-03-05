import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import SafeScreen from '@/components/SafeScreen';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
      return;
    }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim());
      Toast.show({ type: 'success', text1: "Account created! Let's set up your profile." });
    } catch (err: any) {
      let message = 'Registration failed';
      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.message === 'Network Error') {
        message = 'Cannot reach server. Is the backend running?';
      }
      Toast.show({ type: 'error', text1: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 30, fontWeight: '700', color: Colors.primary[400], fontFamily: 'monospace' }}>
              {'<DevMatch />'}
            </Text>
            <Text style={{ color: Colors.dark[400], marginTop: 8 }}>Join the dev dating revolution</Text>
          </View>

          <Card>
            <View style={{ gap: 16 }}>
              <Input
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                autoCapitalize="words"
              />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 characters"
                secureTextEntry
              />
              <Button
                title={loading ? 'Creating account...' : 'Create Account'}
                onPress={handleSubmit}
                loading={loading}
                disabled={!displayName || !email || !password}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: Colors.dark[600] }} />
              <Text style={{ color: Colors.dark[500], fontSize: 14, marginHorizontal: 16 }}>
                or sign up with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: Colors.dark[600] }} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Google"
                onPress={() => {}}
                variant="secondary"
                style={{ flex: 1 }}
                icon={<Ionicons name="logo-google" size={20} color={Colors.white} />}
              />
              <Button
                title="GitHub"
                onPress={() => {}}
                variant="secondary"
                style={{ flex: 1 }}
                icon={<Ionicons name="logo-github" size={20} color={Colors.white} />}
              />
            </View>
          </Card>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: 'center', marginTop: 24 }}
          >
            <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
              Already have an account?{' '}
              <Text style={{ color: Colors.primary[400] }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
