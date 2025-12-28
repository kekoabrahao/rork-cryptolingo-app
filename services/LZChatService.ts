import AsyncStorage from '@react-native-async-storage/async-storage';
import { Analytics } from '@/utils/analytics';

// LZ Mentor System Prompt (Portuguese)
const LZ_SYSTEM_PROMPT = `# VOCÊ É O MENTOR CRIPTO LZ ACADEMY

## IDENTIDADE
Você é Luiz Fernando Benkendorf, fundador da LZ Academy, educador cripto com +70.000 alunos e representante oficial da OKX Brasil. Sua missão é capacitar brasileiros a investirem em criptomoedas com segurança, conhecimento e estratégia.

## TOM DE VOZ
- **Direto e objetivo**: Sem enrolação, vá direto ao ponto essencial
- **Didático**: Explique conceitos complexos como se falasse com um amigo inteligente mas leigo
- **Transparente**: Admita incertezas, nunca prometa retornos garantidos
- **Empático**: Entenda os medos de quem está começando (medo de perder dinheiro, complexidade técnica)
- **Motivacional**: Encoraje o estudo contínuo como base do sucesso

## ESTRUTURA DE COMUNICAÇÃO

### 1. ABERTURA (Gancho Emocional)
- Inicie com contexto atual do mercado
- Use pergunta provocativa quando apropriado
- Crie urgência contextualizada

### 2. DESENVOLVIMENTO (Análise + Educação)
**Análise Técnica:**
- Identifique tendência atual (bullish/bearish/lateral)
- Cite níveis-chave quando relevante
- Analise fundamentos do projeto

**Gestão de Risco:**
- Alocação sugerida
- Stop loss mental
- Tamanho de posição adequado

### 3. CALL-TO-ACTION (Educação First)
- Incentive estudo aprofundado no CryptoLingo
- Próximos passos de aprendizado

## FRASES ASSINATURA
- "Galera, beleza? Vamos direto ao ponto..."
- "Nada do que eu falo aqui é recomendação de investimento, é educação!"
- "O mercado não perdoa quem não estuda"
- "Se você não entende o ativo, não invista nele"

## REGRAS DE OURO
1. **NUNCA prometa retornos**
2. **SEMPRE disclaimers**: "Isso não é recomendação financeira"
3. **Educação > Especulação**
4. **Transparência > Ego**

## IMPORTANTE
- Responda SEMPRE em português brasileiro
- Mantenha respostas entre 150-300 palavras
- Use emojis estrategicamente (📊🔍💰⚠️🎯)
- Estruture com bullet points quando possível
- SEMPRE inclua disclaimer de não ser recomendação
- Seja CONVERSACIONAL
- Mantenha-se APENAS em investimentos cripto
- Se perguntarem outros temas: "Meu foco é te ajudar com investimentos em cripto"

Você é o LZ. Inspire confiança, eduque com excelência! 🚀`;

interface ChatMessage {
  id: string;
  sender: 'user' | 'lz';
  text: string;
  timestamp: number;
}

interface SendMessageResponse {
  success: boolean;
  error?: 'daily_limit' | 'network_error' | 'api_error';
  remaining: number;
  message: string | null;
}

interface DailyLimitCheck {
  allowed: boolean;
  remaining: number;
}

class LZChatService {
  // API Configuration - Replace with your actual endpoint
  private static API_ENDPOINT = process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  private static API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  
  // Storage keys
  private static STORAGE_KEY = '@cryptolingo:lz_chat_history';
  private static DAILY_LIMIT_KEY = '@cryptolingo:lz_daily_questions';
  private static FREE_USER_DAILY_LIMIT = 2;

  /**
   * Get chat history from storage
   */
  static async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const history = await AsyncStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('[LZ Chat] Error loading history:', error);
      Analytics.trackError('lz_chat_load_history_failed', error as Error);
      return [];
    }
  }

  /**
   * Save chat history to storage
   */
  static async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
      Analytics.track('lz_chat_history_saved', { message_count: messages.length });
    } catch (error) {
      console.error('[LZ Chat] Error saving history:', error);
      Analytics.trackError('lz_chat_save_history_failed', error as Error);
    }
  }

  /**
   * Check if user can send message (daily limit for free users)
   */
  static async checkDailyLimit(isPremium: boolean): Promise<DailyLimitCheck> {
    // Premium users have unlimited questions
    if (isPremium) {
      return { allowed: true, remaining: 999 };
    }

    try {
      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem(this.DAILY_LIMIT_KEY);
      
      if (!data) {
        // First question today
        await AsyncStorage.setItem(this.DAILY_LIMIT_KEY, JSON.stringify({
          date: today,
          count: 0
        }));
        return { allowed: true, remaining: this.FREE_USER_DAILY_LIMIT };
      }

      const { date, count } = JSON.parse(data);

      // Reset counter if new day
      if (date !== today) {
        await AsyncStorage.setItem(this.DAILY_LIMIT_KEY, JSON.stringify({
          date: today,
          count: 0
        }));
        return { allowed: true, remaining: this.FREE_USER_DAILY_LIMIT };
      }

      // Check limit
      const remaining = this.FREE_USER_DAILY_LIMIT - count;
      if (count >= this.FREE_USER_DAILY_LIMIT) {
        Analytics.track('lz_chat_daily_limit_reached', { count });
        return { allowed: false, remaining: 0 };
      }

      return { allowed: true, remaining };

    } catch (error) {
      console.error('[LZ Chat] Error checking limit:', error);
      Analytics.trackError('lz_chat_limit_check_failed', error as Error);
      // Fallback: allow question
      return { allowed: true, remaining: this.FREE_USER_DAILY_LIMIT };
    }
  }

  /**
   * Increment daily question count for free users
   */
  private static async incrementQuestionCount(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem(this.DAILY_LIMIT_KEY);
      
      if (data) {
        const { date, count } = JSON.parse(data);
        if (date === today) {
          await AsyncStorage.setItem(this.DAILY_LIMIT_KEY, JSON.stringify({
            date: today,
            count: count + 1
          }));
        }
      }
    } catch (error) {
      console.error('[LZ Chat] Error incrementing count:', error);
    }
  }

  /**
   * Send message to LZ AI and get response
   */
  static async sendMessage(
    userMessage: string, 
    conversationHistory: ChatMessage[] = [], 
    isPremium: boolean = false
  ): Promise<SendMessageResponse> {
    try {
      // Track message sent
      Analytics.track('lz_chat_message_sent', { 
        is_premium: isPremium,
        message_length: userMessage.length,
        conversation_length: conversationHistory.length
      });

      // Check daily limit first
      const { allowed, remaining } = await this.checkDailyLimit(isPremium);
      
      if (!allowed) {
        Analytics.track('lz_chat_blocked_by_limit');
        return {
          success: false,
          error: 'daily_limit',
          remaining: 0,
          message: null
        };
      }

      // Prepare messages for AI (system prompt + history + new message)
      const messages = [
        { role: 'system', content: LZ_SYSTEM_PROMPT },
        ...conversationHistory.slice(-10).map(msg => ({ // Keep last 10 messages for context
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userMessage }
      ];

      // Call OpenAI API
      const startTime = Date.now();
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cheaper and faster than gpt-4
          messages: messages,
          temperature: 0.8, // Creative but controlled
          max_tokens: 800,
          presence_penalty: 0.6, // Encourage diverse responses
          frequency_penalty: 0.3,
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[LZ Chat] API error:', response.status, errorData);
        
        Analytics.track('lz_chat_api_error', { 
          status: response.status,
          error: errorData
        });

        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Track successful response
      Analytics.track('lz_chat_response_received', {
        response_time: responseTime,
        response_length: aiResponse.length,
        tokens_used: data.usage?.total_tokens || 0
      });

      // Increment question count for free users
      if (!isPremium) {
        await this.incrementQuestionCount();
      }

      return {
        success: true,
        error: undefined,
        remaining: remaining - 1,
        message: aiResponse
      };

    } catch (error) {
      console.error('[LZ Chat] Send message error:', error);
      Analytics.trackError('lz_chat_send_failed', error as Error);
      
      return {
        success: false,
        error: 'network_error',
        remaining: 0,
        message: null
      };
    }
  }

  /**
   * Clear all chat history
   */
  static async clearHistory(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      Analytics.track('lz_chat_history_cleared');
      return true;
    } catch (error) {
      console.error('[LZ Chat] Error clearing history:', error);
      Analytics.trackError('lz_chat_clear_failed', error as Error);
      return false;
    }
  }

  /**
   * Get total questions asked today
   */
  static async getTodayQuestionsCount(): Promise<number> {
    try {
      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem(this.DAILY_LIMIT_KEY);
      
      if (!data) return 0;
      
      const { date, count } = JSON.parse(data);
      return date === today ? count : 0;
    } catch (error) {
      console.error('[LZ Chat] Error getting count:', error);
      return 0;
    }
  }
}

export default LZChatService;
export type { ChatMessage, SendMessageResponse, DailyLimitCheck };
