import { StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { hex_sha256 } from '../utils/sha256';
import { makeApiRequest } from '../utils/api';

interface Message {
  text: string;
  isUser: boolean;
}

export default function DocumentViewerScreen() {
  const { username } = useAuth();
  const params = useLocalSearchParams<{ documentName: string }>();
  const [documentContent, setDocumentContent] = useState({ original: '', translated: '' });
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');

  interface ApiResponse {
    ok: boolean;
    status: number;
    text: string;
  }

  useEffect(() => {
    if (username && params.documentName) {
      fetchDocumentContent();
    }
  }, [username, params.documentName]);

  if (!username) {
    Alert.alert('Erro', 'Você precisa estar logado para acessar esta página.');
    return null;
  }

  if (!params.documentName) {
    Alert.alert('Erro', 'Nome do documento não especificado.');
    return null;
  }  const fetchDocumentContent = async () => {
    try {
      const hashedUsername = hex_sha256(username);
      console.log('Buscando documento:', {
        username: hashedUsername,
        documentName: params.documentName
      });
      const response = await makeApiRequest(
        'https://n8n.bernardolobo.com.br/webhook/nome-documento',
        {
          nome_documento: params.documentName
        }
      );
      console.log('Resposta recebida:', response);
      let data;
      try {
        data = JSON.parse(response.text);
        console.log('Dados do documento:', data);
        console.log('documento_extraido:', data.documento_extraido);
        console.log('documento_traduzido:', data.documento_traduzido);
        if (!data.documento_extraido && !data.documento_traduzido) {
          throw new Error('Documento sem conteúdo');
        }
        setDocumentContent({
          original: data.documento_extraido || data.texto || 'Não foi possível carregar o texto original.',
          translated: data.documento_traduzido || data.traducao || 'Não foi possível carregar o texto traduzido.',
        });
      } catch (e) {
        // Se não for JSON, trata como texto puro e separa tradução
        console.warn('Resposta não é JSON. Usando texto puro e separando tradução.');
        const text = response.text || '';
        const traducaoTag = '<INICIO_TRADUCAO_COLQUIAL>';
        let original = text;
        let translated = '';
        if (text.includes(traducaoTag)) {
          const [orig, trans] = text.split(traducaoTag);
          original = orig.trim();
          translated = trans.replace(/<FIM_TRADUCAO_COLQUIAL>.*/s, '').trim();
        }
        setDocumentContent({
          original: original || 'Não foi possível carregar o texto original.',
          translated: translated || '',
        });
        return;
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdo do documento:', err);
      setError('Não foi possível carregar o documento.');
    }
  };
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput('');
    Keyboard.dismiss();

    // Adiciona a mensagem do usuário ao chat
    setChatMessages(prev => [...prev, { text: message, isUser: true }]);

    try {
      // Envia para o endpoint do chat
      const response = await makeApiRequest(
        'https://n8n.bernardolobo.com.br/webhook/d3b5253d-4b6f-4344-aa52-75818c088922',
        {
          chat_input: message,
          nome_documento: params.documentName
        }
      );
      
      // Adiciona a resposta do servidor ao chat
      const responseText = response.text || JSON.stringify(response);
      setChatMessages(prev => [...prev, { text: responseText, isUser: false }]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem. Por favor, tente novamente.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Coluna Esquerda - Documento Original */}
      <ScrollView style={styles.column}>
        <ThemedView style={styles.documentContainer}>
          <ThemedText style={styles.columnTitle}>Documento Original</ThemedText>
          <ThemedText style={styles.documentText}>
            {documentContent.original}
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Coluna do meio - Documento Traduzido */}
      <ScrollView style={[styles.column, styles.middleColumn]}>
        <ThemedText style={styles.columnTitle}>Documento Traduzido</ThemedText>
        <ThemedText style={styles.documentText}>
          {documentContent.translated}
        </ThemedText>
      </ScrollView>

      {/* Coluna Direita - Chat */}
      <ThemedView style={styles.column}>
        <ThemedText style={styles.columnTitle}>Chat</ThemedText>
        <ThemedView style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages}>
            {error ? (
              <ThemedText style={styles.error}>{error}</ThemedText>
            ) : (
              chatMessages.map((msg, index) => (
                <ThemedView
                  key={index}
                  style={[
                    styles.messageContainer,
                    msg.isUser ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <ThemedText style={styles.message}>{msg.text}</ThemedText>
                </ThemedView>
              ))
            )}
          </ScrollView>
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <ThemedText style={styles.sendButtonText}>Enviar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 24,
    gap: 24,
  },
  column: {
    flex: 1,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 8,
    marginRight: 12,
  },
  middleColumn: {
    flex: 2,
    marginRight: 12,
  },
  columnTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
    textAlign: 'center',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  documentContainer: {
    borderRadius: 18,
    padding: 24,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  documentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chatMessages: {
    flex: 1,
    marginBottom: 16,
  },
  messageContainer: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '85%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    alignSelf: 'flex-start',
  },
  message: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    borderRadius: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.13)',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 16,
    fontWeight: '600',
  },
});
