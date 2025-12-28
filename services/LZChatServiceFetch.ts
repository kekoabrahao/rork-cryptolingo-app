import AsyncStorage from '@react-native-async-storage/async-storage';
import { Analytics } from '@/utils/analytics';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cryptolingo.app';
const API_ENDPOINT = `${API_BASE_URL}/api/lz-chat`;

// Storage Keys
const STORAGE_KEY = '@cryptolingo:lz_chat_history';
const DAILY_LIMIT_KEY = '@cryptolingo:lz_daily_questions';
const AUTH_TOKEN_KEY = '@cryptolingo_auth_token';

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
 * LZ Chat Service - REST API with Fetch
 * Direct HTTP communication with authentication
 */
class LZChatServiceFetch {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = API_ENDPOINT;
  }

  /**
   * Get auth token from storage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const authData = await AsyncStorage.getItem('@cryptolingo_auth');
      if (authData) {
        const user = JSON.parse(authData);
        // In production, you would have a separate token field
        return user.id || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Get user ID from auth context
   */
  private async getUserId(): Promise<string> {
    try {
      const authData = await AsyncStorage.getItem('@cryptolingo_auth');
      if (authData) {
        const user = JSON.parse(authData);
        return user.id || `anon_${Date.now()}`;
      }
      return `anon_${Date.now()}`;
    } catch (error) {
      return `anon_${Date.now()}`;
    }
  }

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
   * Check daily limit (local check only)
   */
  async checkDailyLimit(isPremium: boolean): Promise<DailyLimitCheck> {
    try {
      // For premium users, always allow
      if (isPremium) {
        return { allowed: true, remaining: 999 };
      }

      // Check local count
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
   * Send a message to LZ via REST API
   */
  async sendMessage(
    userMessage: string,
    isPremium: boolean
  ): Promise<SendMessageResponse> {
    try {
      // Get conversation history
      const history = await this.getChatHistory();
      
      // Only send last 10 messages for context
      const recentHistory = history.slice(-10);

      // Get auth token and user ID
      const authToken = await this.getAuthToken();
      const userId = await getUserId();

      // Track analytics
      Analytics.track('lz_chat_message_sent', {
        isPremium,
        messageLength: userMessage.length,
        historyLength: recentHistory.length,
        hasAuth: !!authToken,
      });

      // Make API request
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: recentHistory,
          userId,
          isPremium,
        }),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Limite diário atingido. Upgrade para Premium para continuar!');
        } else if (response.status === 401) {
          throw new Error('Autenticação necessária. Faça login para continuar.');
        } else if (response.status === 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.');
        }
        
        throw new Error(errorData.error || 'Erro ao processar sua mensagem.');
      }

      const data = await response.json();

      if (data.success && data.message) {
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
            content: data.message,
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
          responseLength: data.message.length,
          remaining: data.remaining,
        });

        return {
          success: true,
          message: data.message,
          remaining: data.remaining || (isPremium ? 999 : await this.getTodayQuestionsCount()),
          isLimitReached: data.isLimitReached || false,
        };
      }

      throw new Error('Resposta inválida do servidor');
    } catch (error: any) {
      console.error('LZ Chat send message error:', error);

      Analytics.track('lz_chat_message_error', {
        error: error.message || 'Unknown error',
        isPremium,
      });

      // Handle specific errors
      if (error.message?.includes('Limite diário atingido')) {
        return {
          success: false,
          error: 'Você atingiu o limite de 2 perguntas diárias. Faça upgrade para Premium!',
          remaining: 0,
          isLimitReached: true,
        };
      }

      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        return {
          success: false,
          error: 'Erro de conexão. Verifique sua internet e tente novamente.',
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
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const LZChatService = new LZChatServiceFetch();

/**
 * Named export for compatibility
 */
export default LZChatService;
