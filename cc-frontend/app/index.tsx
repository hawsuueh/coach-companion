// Imports
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';

// Export login component
export default function LoginScreen() {
  // Logic
  const [role, setRole] = useState<'coach' | 'athlete' | 'director' | null>(
    null
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const roles = ['coach', 'athlete', 'director'];

  const handleLogin = () => {
    const routes = {
      coach: '/(coach)/(tabs)/home',
      athlete: '/(athlete)/(tabs)/home',
      director: '/(director)/(tabs)/home'
    };

    if (role && routes[role]) {
      router.replace(routes[role] as any);
    }
  };

  // Structure
  return (
    <ImageBackground
      source={require('@/assets/backgrounds/bg-login.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* White transparent overlay */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Header with logos */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/logos/logo-cc.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/logos/logo-unc.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main content - centered */}
        <View style={styles.centerContent}>
          {/* App title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Coach</Text>
            <Text style={styles.title}>Companion</Text>

            <Text style={styles.loginTitle}>LOGIN</Text>
            <Text style={styles.subtitle}>Please sign in to continue</Text>
          </View>

          {/* Role selection */}
          <View style={styles.roleContainer}>
            {roles.map(roleOption => (
              <TouchableOpacity
                key={roleOption}
                onPress={() => setRole(roleOption as typeof role)}
                style={[
                  styles.roleButton,
                  role === roleOption && styles.roleButtonActive
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === roleOption && styles.roleTextActive
                  ]}
                >
                  {roleOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input fields */}
          <View style={styles.inputContainer}>
            {/* Email input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.icon}>✉</Text>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Password input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

// Styles
const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)'
  },
  container: {
    flex: 1,
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 48
  },
  logo: {
    height: 100,
    width: 100
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
    lineHeight: 52
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    color: '#000'
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 4
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 40
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 4
  },
  roleButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626'
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize'
  },
  roleTextActive: {
    color: '#fff'
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  icon: {
    marginRight: 12,
    fontSize: 16,
    color: '#9CA3AF'
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827'
  },
  loginButton: {
    backgroundColor: '#374151',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  }
});
