import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle, Send, Trash2, X, Crown, Sparkles } from 'lucide-react-native';
import { useLZChat } from '@/contexts/LZChatContext';
import { usePremium } from '@/contexts/PremiumContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function LZChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  
  const { messages, isLoading, questionsRemaining, sendMessage, clearHistory } = useLZChat();
  const { isPremium, showUpgradeModal } = usePremium();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage = inputText.trim();
    setInputText(''); // Clear input immediately

    const response = await sendMessage(userMessage);

    if (!response.success) {
      if (response.error === 'daily_limit') {
        Alert.alert(
          '🔒 Limite Diário Atingido',
          'Você atingiu o limite de 2 perguntas gratuitas por dia. Faça upgrade para Premium e tenha perguntas ilimitadas!',
          [
            { text: 'Mais Tarde', style: 'cancel' },
            { 
              text: 'Ver Premium', 
              style: 'default',
              onPress: () => showUpgradeModal('Unlimited LZ Chat')
            }
          ]
        );
      } else {
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível enviar sua mensagem. Verifique sua conexão e tente novamente.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja apagar toda a conversa com o LZ?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      ]
    );
  };

  const renderMessage = (msg: any, index: number) => {
    const isUser = msg.sender === 'user';
    const isLastMessage = index === messages.length - 1;

    return (
      <View
        key={msg.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.lzMessageContainer
        ]}
      >
        {!isUser && (
          <View style={styles.lzAvatar}>
            <Sparkles size={20} color="#FFD700" />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.lzBubble
          ]}
        >
          {!isUser && (
            <Text style={styles.lzName}>LZ Academy</Text>
          )}
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.lzText
          ]}>
            {msg.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.lzTimestamp
          ]}>
            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <MessageCircle size={16} color={Colors.primary} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <X size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarContainer}>
            <Sparkles size={24} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Converse com o LZ</Text>
            <Text style={styles.headerSubtitle}>
              Mentor de Investimentos em Cripto
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Trash2 size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Questions Remaining Badge */}
      {!isPremium && (
        <View style={styles.limitBadge}>
          <Text style={styles.limitText}>
            {questionsRemaining} {questionsRemaining === 1 ? 'pergunta restante' : 'perguntas restantes'} hoje
          </Text>
          <TouchableOpacity 
            onPress={() => showUpgradeModal('Unlimited LZ Chat')}
            style={styles.premiumBadge}
          >
            <Crown size={12} color="#FFD700" />
            <Text style={styles.premiumText}>Premium = Ilimitado</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={48} color="#FFD700" />
              <Text style={styles.emptyTitle}>Olá! Sou o LZ 👋</Text>
              <Text style={styles.emptyText}>
                Faça perguntas sobre investimentos em criptomoedas e receba orientações especializadas.
              </Text>
              <View style={styles.exampleQuestions}>
                <Text style={styles.exampleTitle}>Exemplos de perguntas:</Text>
                <TouchableOpacity 
                  style={styles.exampleButton}
                  onPress={() => setInputText('É bom momento para comprar Bitcoin?')}
                >
                  <Text style={styles.exampleButtonText}>
                    💰 É bom momento para comprar Bitcoin?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.exampleButton}
                  onPress={() => setInputText('Como diversificar meu portfólio cripto?')}
                >
                  <Text style={styles.exampleButtonText}>
                    📊 Como diversificar meu portfólio?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.exampleButton}
                  onPress={() => setInputText('Qual a diferença entre Bitcoin e Ethereum?')}
                >
                  <Text style={styles.exampleButtonText}>
                    🔍 Bitcoin vs Ethereum?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            messages.map((msg, index) => renderMessage(msg, index))
          )}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.lzAvatar}>
                <Sparkles size={20} color="#FFD700" />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>LZ está pensando...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Pergunte ao LZ sobre investimentos..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            ⚠️ Isso não é recomendação de investimento. Sempre faça sua própria pesquisa.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  headerAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  clearButton: {
    padding: 8,
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  limitText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFD700',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  lzMessageContainer: {
    justifyContent: 'flex-start',
  },
  lzAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  lzBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lzName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  lzText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  lzTimestamp: {
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
    marginBottom: 24,
  },
  exampleQuestions: {
    width: '100%',
    paddingHorizontal: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  exampleButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exampleButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  disclaimer: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
