import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

export default function HomeScreen() {  
  const { username } = useAuth();
  
  if (!username) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Erro</ThemedText>
        <ThemedText style={styles.subtitle}>
          Você precisa estar logado para acessar esta página.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Assistente Jurídico IA</ThemedText>
      <ThemedText style={styles.subtitle}>
        Simplifique a compreensão de documentos jurídicos
      </ThemedText>
        <View style={styles.content}>
        <View style={styles.uploadSection}>
          <DocumentUpload 
            username={username} 
            onSuccess={(documentName) => {
              router.push({
                pathname: '/document-viewer',
                params: { documentName }
              });
            }} 
          />
        </View>
        <View style={styles.listSection}>
          <DocumentList username={username} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 36,
    backgroundColor: '#0f172a',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: 32, // Distância da NavBar
    marginBottom: 10,
    textAlign: 'center',
    color: '#2563eb',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#cbd5e1',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    gap: 32,
  },
  uploadSection: {
    marginBottom: 0,
  },
  listSection: {
    flex: 1,
  },
});
