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

  // Adiciona CSS global para body com tamanho e altura mínimos no web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        body {
          min-height: 100vh;
          min-width: 320px;
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
    <ThemedView
      style={[
        styles.container,
        Platform.OS === 'web' ? { 
          overflow: 'hidden' // Evita scroll horizontal
        } : null
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Seus Documentos</ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDocuments}>
          <ThemedText style={styles.refreshButtonText}>↻</ThemedText>
          <ThemedText style={styles.refreshButtonText}>Atualizar</ThemedText>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ThemedText style={styles.loadingText}>Carregando documentos...</ThemedText>
      ) : (
        Platform.OS === 'web' ? (
          <div
            className="juria-scrollbar"
            style={{
              height: styles.list.maxHeight + 'px',
              overflowY: 'auto',
              overflowX: 'hidden',
              marginTop: styles.list.marginTop,
              padding: '8px 4px',
              boxSizing: 'border-box',
            }}
          >
            {documents.map((doc, index) => (
              <div
                key={index}
                style={{
                  cursor: 'pointer',
                  marginBottom: `${width < 600 ? 10 : 14}px`,
                  borderRadius: '16px',
                  padding: `${width < 600 ? 14 : 18}px ${width < 600 ? 16 : 22}px`,
                  background: 'rgba(37, 99, 235, 0.07)',
                  border: '1px solid rgba(37, 99, 235, 0.13)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.1)';
                }}
                onClick={() => handleDocumentSelect(doc)}
              >
                <span style={{
                  fontSize: `${width < 600 ? 16 : 17}px`,
                  color: '#fff',
                  fontWeight: '600',
                  letterSpacing: '0.3px',
                  display: 'block',
                }}>{doc}</span>
              </div>
            ))}
            {documents.length === 0 && !error && (
              <div style={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: `${width < 600 ? 15 : 16}px`,
                marginTop: '32px',
                maxWidth: '300px',
                margin: '32px auto 0',
              }}>
                Nenhum documento encontrado
              </div>
            )}
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
    paddingVertical: width < 600 ? 16 : 24,
    paddingHorizontal: width < 600 ? 12 : 24,
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    maxHeight: height * 0.75, // Um pouco mais alto
  },  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: width < 600 ? 0 : 10,
    paddingHorizontal: width < 600 ? 12 : 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  title: {
    fontSize: width < 600 ? 20 : 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  list: {
    flex: 1,
    marginTop: width < 600 ? 8 : 16,
    maxHeight: height * 0.65,
  },
  documentItem: {
    backgroundColor: 'rgba(37, 99, 235, 0.07)',
    paddingVertical: width < 600 ? 14 : 10,
    paddingHorizontal: width < 600 ? 16 : 10,
    borderRadius: 16,
    marginBottom: width < 600 ? 10 : 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.13)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        transform: 'translateY(-2px)',
        shadowOpacity: 0.15,
      }
    } : {}),
  },
  documentName: {
    fontSize: width < 600 ? 16 : 17,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: width < 600 ? 15 : 16,
    marginBottom: 20,
    maxWidth: 400,
    alignSelf: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: width < 600 ? 15 : 16,
    marginTop: 32,
    maxWidth: 300,
    alignSelf: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: width < 600 ? 15 : 16,
    marginTop: 32,
  },
  refreshButton: {
    padding: width < 600 ? 10 : 12,
    paddingHorizontal: width < 600 ? 14 : 16,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        transform: 'translateY(-1px)',
      }
    } : {}),
  },
  refreshButtonText: {
    fontSize: width < 600 ? 14 : 15,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: width < 600 ? 12 : 14,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
    minWidth: 180,
  },
  retryText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: width < 600 ? 14 : 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});
