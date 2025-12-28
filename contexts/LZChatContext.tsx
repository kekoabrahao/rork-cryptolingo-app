import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import LZChatService, { ChatMessage, SendMessageResponse } from '@/services/LZChatService';
import { usePremium } from '@/contexts/PremiumContext';
import { Analytics } from '@/utils/analytics';

interface LZChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  questionsRemaining: number;
  sendMessage: (text: string) => Promise<SendMessageResponse>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

const LZChatContext = createContext<LZChatContextType | undefined>(undefined);

export const LZChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(2);
  
  const { isPremium } = usePremium();

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
    updateQuestionsRemaining();
  }, []);

  // Update questions remaining when premium status changes
  useEffect(() => {
    updateQuestionsRemaining();
  }, [isPremium]);

  const loadHistory = async () => {
    try {
      const history = await LZChatService.getChatHistory();
      setMessages(history);
      Analytics.track('lz_chat_history_loaded', { message_count: history.length });
    } catch (error) {
      console.error('[LZ Chat Context] Load history error:', error);
    }
  };

  const updateQuestionsRemaining = async () => {
    if (isPremium) {
      setQuestionsRemaining(999);
    } else {
      const { remaining } = await LZChatService.checkDailyLimit(false);
      setQuestionsRemaining(remaining);
    }
  };

  const sendMessage = async (text: string): Promise<SendMessageResponse> => {
    setIsLoading(true);
    
    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: text,
        timestamp: Date.now()
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      await LZChatService.saveChatHistory(updatedMessages);

      // Send to AI and get response
      const response = await LZChatService.sendMessage(text, messages, isPremium);

      if (response.success && response.message) {
        // Add LZ's response
        const lzMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'lz',
          text: response.message,
          timestamp: Date.now()
        };

        const finalMessages = [...updatedMessages, lzMessage];
        setMessages(finalMessages);
        await LZChatService.saveChatHistory(finalMessages);
        
        // Update remaining questions
        setQuestionsRemaining(response.remaining);

        Analytics.track('lz_chat_conversation_updated', {
          total_messages: finalMessages.length,
          is_premium: isPremium
        });
      } else {
        // Handle error - remove user message if failed
        setMessages(messages);
      }

      return response;

    } catch (error) {
      console.error('[LZ Chat Context] Send message error:', error);
      setMessages(messages); // Revert on error
      return {
        success: false,
        error: 'network_error',
        remaining: questionsRemaining,
        message: null
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const success = await LZChatService.clearHistory();
      if (success) {
        setMessages([]);
        Analytics.track('lz_chat_history_cleared_by_user');
      }
    } catch (error) {
      console.error('[LZ Chat Context] Clear history error:', error);
    }
  };

  return (
    <LZChatContext.Provider
      value={{
        messages,
        isLoading,
        questionsRemaining,
        sendMessage,
        clearHistory,
        loadHistory
      }}
    >
      {children}
    </LZChatContext.Provider>
  );
};

export const useLZChat = (): LZChatContextType => {
  const context = useContext(LZChatContext);
  if (!context) {
    throw new Error('useLZChat must be used within LZChatProvider');
  }
  return context;
};

export default LZChatContext;
