import { publicProcedure } from "@/backend/trpc/create-context";
import { checkDailyLimitSchema } from "./schema";
import { rateLimiter } from "./rate-limiter";

/**
 * Check Daily Limit
 * Returns remaining questions for today
 */
export default publicProcedure
  .input(checkDailyLimitSchema)
  .query(({ input }) => {
    const { userId, isPremium } = input;

    const { allowed, remaining } = rateLimiter.checkLimit(userId, isPremium);

    return {
      success: true,
      allowed,
      remaining: isPremium ? 999 : remaining,
      isLimitReached: !allowed,
      currentCount: rateLimiter.getCurrentCount(userId),
      maxLimit: isPremium ? 999 : 2,
    };
  });
