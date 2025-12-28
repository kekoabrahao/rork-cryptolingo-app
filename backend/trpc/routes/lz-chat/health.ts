import { publicProcedure } from "@/backend/trpc/create-context";
import { lzChatService } from "./service";
import { rateLimiter } from "./rate-limiter";

/**
 * Health Check for LZ Chat Service
 * Verifies OpenAI connectivity and rate limiter status
 */
export default publicProcedure.query(async () => {
  const openAIHealthy = await lzChatService.healthCheck();
  const stats = rateLimiter.getStats();

  return {
    success: true,
    status: openAIHealthy ? "healthy" : "degraded",
    openAI: {
      connected: openAIHealthy,
      model: "gpt-4o-mini",
    },
    rateLimiter: {
      active: true,
      stats,
    },
    timestamp: new Date().toISOString(),
  };
});
