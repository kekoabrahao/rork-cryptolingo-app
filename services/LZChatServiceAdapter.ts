import AsyncStorage from '@react-native-async-storage/async-storage';
import { Analytics } from '@/utils/analytics';
import { trpc } from '@/utils/trpc';

// Storage Keys
const STORAGE_KEY = '@cryptolingo:lz_chat_history';
const DAILY_LIMIT_KEY = '@cryptolingo:lz_daily_questions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
  remaining?: number;
  isLimitReached?: boolean;
}

export interface DailyLimitCheck {
  allowed: boolean;
  remaining: number;
}

/**
 * LZ Chat Service - tRPC Adapter
 * Handles all communication with the LZ Chat backend via tRPC
 */
class LZChatServiceAdapter {
  /**
   * Get chat history from local storage
   */
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Save chat history to local storage
   */
  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      // Keep only last 10 messages for context
      const recentMessages = messages.slice(-10);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recentMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Get today's question count from local storage
   */
  async getTodayQuestionsCount(): Promise<number> {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(DAILY_LIMIT_KEY);
      
      if (!stored) return 0;
      
      const { date, count } = JSON.parse(stored);
      
      // Reset if it's a new day
      if (date !== today) {
        await AsyncStorage.setItem(
          DAILY_LIMIT_KEY,
          JSON.stringify({ date: today, count: 0 })
        );
        return 0;
      }
      
      return count;
    } catch (error) {
      console.error('Error getting question count:', error);
      return 0;
    }
  }

  /**
   * Increment today's question count
   */
  async incrementQuestionCount(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const count = await this.getTodayQuestionsCount();
      
      await AsyncStorage.setItem(
        DAILY_LIMIT_KEY,
        JSON.stringify({ date: today, count: count + 1 })
      );
    } catch (error) {
      console.error('Error incrementing question count:', error);
    }
  }

  /**
   * Check daily limit (local + backend validation)
   */
  async checkDailyLimit(
    userId: string,
    isPremium: boolean
  ): Promise<DailyLimitCheck> {
    try {
      // For premium users, always allow
      if (isPremium) {
        return { allowed: true, remaining: 999 };
      }

      // Check local count first (faster)
      const localCount = await this.getTodayQuestionsCount();
      const localRemaining = Math.max(0, 2 - localCount);

      if (localCount >= 2) {
        return { allowed: false, remaining: 0 };
      }

      return { allowed: true, remaining: localRemaining };
    } catch (error) {
      console.error('Error checking daily limit:', error);
      // Fail open for better UX
      return { allowed: true, remaining: 1 };
    }
  }

  /**
   * Send a message to LZ via tRPC
   */
  async sendMessage(
    userMessage: string,
    isPremium: boolean,
    userId?: string
  ): Promise<SendMessageResponse> {
    try {
      // Get conversation history
      const history = await this.getChatHistory();
      
      // Only send last 10 messages for context (API limit)
      const recentHistory = history.slice(-10);

      // Track analytics
      Analytics.track('lz_chat_message_sent', {
        isPremium,
        messageLength: userMessage.length,
        historyLength: recentHistory.length,
      });

      // Call tRPC mutation
      const response = await trpc.lzChat.sendMessage.mutate({
        message: userMessage,
        conversationHistory: recentHistory,
        userId,
        isPremium,
      });

      if (response.success && response.message) {
        // Add user message and AI response to history
        const newMessages: ChatMessage[] = [
          ...history,
          {
            role: 'user',
            content: userMessage,
            timestamp: Date.now(),
          },
          {
            role: 'assistant',
            content: response.message,
            timestamp: Date.now(),
          },
        ];

        // Save updated history
        await this.saveChatHistory(newMessages);

        // Increment local counter for free users
        if (!isPremium) {
          await this.incrementQuestionCount();
        }

        Analytics.track('lz_chat_message_received', {
          isPremium,
          responseLength: response.message.length,
          remaining: response.remaining,
        });

        return {
          success: true,
          message: response.message,
          remaining: response.remaining,
          isLimitReached: response.isLimitReached,
        };
      }

      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('LZ Chat send message error:', error);

      Analytics.track('lz_chat_message_error', {
        error: error.message || 'Unknown error',
        isPremium,
      });

      // Handle rate limit errors
      if (error.message?.includes('Limite diário atingido')) {
        return {
          success: false,
          error: 'Você atingiu o limite de 2 perguntas diárias. Faça upgrade para Premium!',
          remaining: 0,
          isLimitReached: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Erro ao processar sua mensagem. Tente novamente.',
      };
    }
  }

  /**
   * Clear chat history
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      Analytics.track('lz_chat_history_cleared');
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  /**
   * Health check of the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await trpc.lzChat.health.query();
      return response.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const LZChatService = new LZChatServiceAdapter();
