import { createTRPCRouter } from "@/backend/trpc/create-context";
import sendMessage from "./send-message";
import checkLimit from "./check-limit";
import clearHistory from "./clear-history";
import health from "./health";

/**
 * LZ Chat Router
 * All endpoints for the AI crypto investment advisor
 * 
 * Endpoints:
 * - sendMessage: POST /api/trpc/lzChat.sendMessage
 * - checkLimit: GET /api/trpc/lzChat.checkLimit
 * - clearHistory: POST /api/trpc/lzChat.clearHistory
 * - health: GET /api/trpc/lzChat.health
 */
export const lzChatRouter = createTRPCRouter({
  sendMessage,
  checkLimit,
  clearHistory,
  health,
});
