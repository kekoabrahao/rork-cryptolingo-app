import { z } from "zod";

/**
 * LZ Chat Message Schema
 * Represents a single message in the conversation
 */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.number().optional(),
});

/**
 * Send Message Request Schema
 * Validates incoming chat requests
 */
export const sendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationHistory: z.array(chatMessageSchema).max(10), // Last 10 messages for context
  userId: z.string().optional(), // For authenticated users
  isPremium: z.boolean().default(false),
});

/**
 * Check Daily Limit Request Schema
 * Validates daily limit check requests
 */
export const checkDailyLimitSchema = z.object({
  userId: z.string(),
  isPremium: z.boolean().default(false),
});

/**
 * Clear History Request Schema
 * Validates history clearing requests
 */
export const clearHistorySchema = z.object({
  userId: z.string(),
});

/**
 * Chat Response Schema
 * Standardized response format
 */
export const chatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  remaining: z.number().optional(), // Questions remaining today
  isLimitReached: z.boolean().optional(),
});

/**
 * TypeScript Types (exported for use in frontend)
 */
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
export type CheckDailyLimitRequest = z.infer<typeof checkDailyLimitSchema>;
export type ClearHistoryRequest = z.infer<typeof clearHistorySchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
