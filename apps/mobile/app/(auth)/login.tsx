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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Toast.show({ type: 'success', text1: 'Welcome back!' });
    } catch (err: any) {
      let message = 'Something went wrong';
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
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 30, fontWeight: '700', color: Colors.primary[400], fontFamily: 'monospace' }}>
              {'<DevMatch />'}
            </Text>
            <Text style={{ color: Colors.dark[400], marginTop: 8 }}>Welcome back, developer</Text>
          </View>

          <Card>
            <View style={{ gap: 16 }}>
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
                placeholder="Your password"
                secureTextEntry
              />
              <Button
                title={loading ? 'Logging in...' : 'Log in'}
                onPress={handleSubmit}
                loading={loading}
                disabled={!email || !password}
              />
            </View>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: Colors.dark[600] }} />
              <Text style={{ color: Colors.dark[500], fontSize: 14, marginHorizontal: 16 }}>
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: Colors.dark[600] }} />
            </View>

            {/* OAuth buttons */}
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
            onPress={() => router.push('/(auth)/register')}
            style={{ alignItems: 'center', marginTop: 24 }}
          >
            <Text style={{ color: Colors.dark[400], fontSize: 14 }}>
              Don't have an account?{' '}
              <Text style={{ color: Colors.primary[400] }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
