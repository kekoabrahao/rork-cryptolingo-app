/**
 * In-Memory Rate Limiting Store
 * For production, use Redis or a database
 */

interface UserDailyLimit {
  userId: string;
  count: number;
  date: string; // YYYY-MM-DD format
  lastReset: Date;
}

class RateLimiter {
  private limits: Map<string, UserDailyLimit> = new Map();
  private readonly FREE_DAILY_LIMIT = 2;
  private readonly PREMIUM_DAILY_LIMIT = 999; // Effectively unlimited

  /**
   * Get today's date string in YYYY-MM-DD format
   */
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Check if user has exceeded their daily limit
   * @param userId - User identifier
   * @param isPremium - Whether user has premium subscription
   * @returns { allowed: boolean, remaining: number }
   */
  checkLimit(userId: string, isPremium: boolean): { allowed: boolean; remaining: number } {
    const maxLimit = isPremium ? this.PREMIUM_DAILY_LIMIT : this.FREE_DAILY_LIMIT;
    const today = this.getTodayString();
    
    let userLimit = this.limits.get(userId);

    // Reset counter if it's a new day
    if (!userLimit || userLimit.date !== today) {
      userLimit = {
        userId,
        count: 0,
        date: today,
        lastReset: new Date(),
      };
      this.limits.set(userId, userLimit);
    }

    const remaining = Math.max(0, maxLimit - userLimit.count);
    const allowed = userLimit.count < maxLimit;

    return { allowed, remaining };
  }

  /**
   * Increment user's question count
   * @param userId - User identifier
   * @param isPremium - Whether user has premium subscription
   */
  incrementCount(userId: string, isPremium: boolean): void {
    const today = this.getTodayString();
    let userLimit = this.limits.get(userId);

    if (!userLimit || userLimit.date !== today) {
      userLimit = {
        userId,
        count: 1,
        date: today,
        lastReset: new Date(),
      };
    } else {
      userLimit.count += 1;
    }

    this.limits.set(userId, userLimit);
  }

  /**
   * Get current count for a user
   * @param userId - User identifier
   * @returns Current question count for today
   */
  getCurrentCount(userId: string): number {
    const today = this.getTodayString();
    const userLimit = this.limits.get(userId);

    if (!userLimit || userLimit.date !== today) {
      return 0;
    }

    return userLimit.count;
  }

  /**
   * Reset limits for a specific user (for testing)
   * @param userId - User identifier
   */
  resetUser(userId: string): void {
    this.limits.delete(userId);
  }

  /**
   * Clear all limits (for testing)
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Clean up old entries (run periodically)
   * Removes entries older than 2 days
   */
  cleanup(): void {
    const today = this.getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    for (const [userId, limit] of this.limits.entries()) {
      if (limit.date !== today && limit.date !== yesterdayString) {
        this.limits.delete(userId);
      }
    }
  }

  /**
   * Get stats for monitoring
   */
  getStats(): {
    totalUsers: number;
    activeToday: number;
    totalQuestions: number;
  } {
    const today = this.getTodayString();
    let totalQuestions = 0;
    let activeToday = 0;

    for (const limit of this.limits.values()) {
      if (limit.date === today) {
        activeToday += 1;
        totalQuestions += limit.count;
      }
    }

    return {
      totalUsers: this.limits.size,
      activeToday,
      totalQuestions,
    };
  }
}

/**
 * Singleton instance
 */
export const rateLimiter = new RateLimiter();

/**
 * Run cleanup every hour
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * For production: Database-backed rate limiting
 * 
 * Example schema:
 * 
 * CREATE TABLE lz_chat_limits (
 *   user_id VARCHAR(255) PRIMARY KEY,
 *   question_count INTEGER DEFAULT 0,
 *   date DATE NOT NULL,
 *   last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   INDEX idx_date (date)
 * );
 * 
 * Usage:
 * 
 * async function checkLimitDB(userId: string, isPremium: boolean) {
 *   const today = new Date().toISOString().split('T')[0];
 *   const maxLimit = isPremium ? 999 : 2;
 *   
 *   const result = await db.query(
 *     'SELECT question_count FROM lz_chat_limits WHERE user_id = ? AND date = ?',
 *     [userId, today]
 *   );
 *   
 *   const count = result[0]?.question_count || 0;
 *   const remaining = Math.max(0, maxLimit - count);
 *   const allowed = count < maxLimit;
 *   
 *   return { allowed, remaining };
 * }
 */
