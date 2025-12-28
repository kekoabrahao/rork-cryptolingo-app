import { publicProcedure } from "@/backend/trpc/create-context";
import { sendMessageSchema } from "./schema";
import { lzChatService } from "./service";
import { rateLimiter } from "./rate-limiter";
import { TRPCError } from "@trpc/server";

/**
 * Send Message to LZ
 * Main endpoint for chat interactions
 */
export default publicProcedure
  .input(sendMessageSchema)
  .mutation(async ({ input }) => {
    const { message, conversationHistory, userId, isPremium } = input;

    try {
      // Generate a temporary userId if not authenticated
      const effectiveUserId = userId || `anon_${Date.now()}`;

      // Check rate limit for non-premium users
      if (!isPremium) {
        const { allowed, remaining } = rateLimiter.checkLimit(
          effectiveUserId,
          false
        );

        if (!allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Limite diário atingido. Upgrade para Premium para continuar!",
          });
        }

        // User has questions remaining, log it
        console.log(
          `User ${effectiveUserId} has ${remaining} questions remaining today`
        );
      }

      // Call OpenAI service
      const aiResponse = await lzChatService.sendMessage(
        message,
        conversationHistory
      );

      // Increment counter for non-premium users
      if (!isPremium) {
        rateLimiter.incrementCount(effectiveUserId, false);
      }

      // Calculate remaining questions
      const { remaining } = rateLimiter.checkLimit(effectiveUserId, isPremium);

      return {
        success: true,
        message: aiResponse,
        remaining: isPremium ? 999 : remaining,
        isLimitReached: !isPremium && remaining === 0,
      };
    } catch (error) {
      console.error("LZ Chat Error:", error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao processar sua mensagem. Tente novamente.",
      });
    }
  });
