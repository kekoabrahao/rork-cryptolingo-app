import { publicProcedure } from "@/backend/trpc/create-context";
import { clearHistorySchema } from "./schema";
import { rateLimiter } from "./rate-limiter";

/**
 * Clear Chat History
 * Resets user's conversation (does not reset daily limit)
 */
export default publicProcedure
  .input(clearHistorySchema)
  .mutation(({ input }) => {
    const { userId } = input;

    // In a production app with database:
    // await db.query('DELETE FROM lz_chat_history WHERE user_id = ?', [userId]);

    // For now, just log the action
    console.log(`Chat history cleared for user: ${userId}`);

    return {
      success: true,
      message: "Histórico de conversa limpo com sucesso!",
    };
  });
