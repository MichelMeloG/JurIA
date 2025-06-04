import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Platform } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import { hex_sha256 } from '../utils/sha256';

interface DocumentListProps {
  username: string;
}

export default function DocumentList({ username }: DocumentListProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const hashedUsername = hex_sha256(username);
      console.log('Fetching documents for user:', username);
      console.log('Hashed username:', hashedUsername);
      const response = await fetch(
        `https://n8n.bernardolobo.com.br/webhook/historico-documentos`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ username: hashedUsername })
        }
      );
        if (!response.ok) {
        throw new Error('Falha ao buscar documentos');
      }

      // Primeiro, vamos obter o texto da resposta
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let documentList: string[] = [];

      // Se a resposta estiver vazia
      if (!responseText.trim()) {
        console.log('Resposta vazia do servidor');
        documentList = [];
      } else {
        try {
          // Tenta fazer parse como JSON primeiro
          const data = JSON.parse(responseText);
          if (Array.isArray(data)) {
            documentList = data;
          } else if (typeof data === 'string') {
            // Se for uma string JSON, processa como texto
            documentList = data
              .split(/[\r\n,]+/)
              .map(item => item.trim())
              .filter(item => item.length > 0);
          }
        } catch (jsonError) {
          // Se não for JSON válido, trata como texto puro
          console.log('Processando como texto puro');
          documentList = responseText
            .split(/[\r\n,]+/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
      }
      
      console.log('Lista de documentos processada:', documentList);
      setDocuments(documentList);
      
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError('Não foi possível carregar os documentos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchDocuments();
    }
  }, [username]);

  const handleDocumentSelect = (documentName: string) => {
    router.push({
      pathname: '/document-viewer',
      params: { documentName }
    });
  };

  // Only apply custom scrollbar on web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Scrollbar bonita para .juria-scrollbar */
        .juria-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #1e293b;
        }
        .juria-scrollbar::-webkit-scrollbar {
          width: 14px;
          background: #1e293b;
          border-radius: 10px;
        }
        .juria-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 60%, #2563eb 100%);
          border-radius: 10px;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 12px 2px rgba(59,130,246,0.18);
          min-height: 40px;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .juria-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 60%, #1e40af 100%);
          box-shadow: 0 4px 16px 4px rgba(37,99,235,0.25);
        }
        .juria-scrollbar::-webkit-scrollbar-corner {
          background: #1e293b;
        }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, []);

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
          <ThemedText style={styles.retryText}>🔄 Atualizar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Seus Documentos</ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDocuments}>
          <ThemedText>🔄</ThemedText>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ThemedText style={styles.loadingText}>Carregando documentos...</ThemedText>
      ) : (
        Platform.OS === 'web' ? (
          <div className="juria-scrollbar" style={{ height: styles.list.maxHeight, overflowY: 'auto' }}>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {documents.map((doc, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.documentItem}
                  onPress={() => handleDocumentSelect(doc)}
                >
                  <ThemedText style={styles.documentName}>{doc}</ThemedText>
                </TouchableOpacity>
              ))}
              {documents.length === 0 && !error && (
                <ThemedText style={styles.emptyMessage}>
                  Nenhum documento encontrado
                </ThemedText>
              )}
            </ScrollView>
          </div>
        ) : (
          <ScrollView
            style={[styles.list]}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.documentItem}
                onPress={() => handleDocumentSelect(doc)}
              >
                <ThemedText style={styles.documentName}>{doc}</ThemedText>
              </TouchableOpacity>
            ))}
            {documents.length === 0 && !error && (
              <ThemedText style={styles.emptyMessage}>
                Nenhum documento encontrado
              </ThemedText>
            )}
          </ScrollView>
        )
      )}
    </ThemedView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: width < 600 ? 12 : 24,
    paddingHorizontal: width < 600 ? 8 : 18,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 18,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 8,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    maxHeight: height * 0.7, // Responsivo verticalmente
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingBottom: width < 600 ? 8 : 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,60,60,0.08)',
  },
  title: {
    fontSize: width < 600 ? 18 : 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  list: {
    flex: 1,
    marginTop: width < 600 ? 6 : 12,
    maxHeight: height * 0.6, // Responsivo verticalmente
  },
  documentItem: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingVertical: width < 600 ? 10 : 18,
    paddingHorizontal: width < 600 ? 10 : 18,
    borderRadius: 14,
    marginBottom: width < 600 ? 8 : 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.13)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  documentName: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 20,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  retryText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  }
});
