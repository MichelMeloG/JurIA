import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface NavBarProps {
  showAuthButtons?: boolean;
}

export default function NavBar({ showAuthButtons = false }: NavBarProps) {
  const { logout } = useAuth();
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#0f172a' }, 'background');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity 
        style={styles.logoContainer}
        onPress={() => router.push('/')}
      >
        <Image 
          source={require('../assets/images/favicon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>JurIA</ThemedText>
      </TouchableOpacity>
        {showAuthButtons ? (
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push('/register')}
          >
            <ThemedText style={styles.buttonText}>Register</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <ThemedText style={styles.buttonText}>Logout</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(21,23,24,0.92)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(37,99,235,0.18)', // azul institucional sutil
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  registerButton: {
    backgroundColor: '#2563eb',
  },
  logoutButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
