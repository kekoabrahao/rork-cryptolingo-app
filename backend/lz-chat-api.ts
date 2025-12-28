import { Hono } from 'hono';
import { lzChatService } from './trpc/routes/lz-chat/service';
import { rateLimiter } from './trpc/routes/lz-chat/rate-limiter';
import { sendMessageSchema } from './trpc/routes/lz-chat/schema';

const lzChatAPI = new Hono();

/**
 * REST API endpoint for LZ Chat
 * Alternative to tRPC for simpler integration
 */

/**
 * POST /api/lz-chat
 * Send a message to LZ
 */
lzChatAPI.post('/', async (c) => {
  try {
    // Get request body
    const body = await c.req.json();

    // Validate input
    const validation = sendMessageSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        400
      );
    }

    const { message, conversationHistory, userId, isPremium } = validation.data;

    // Extract auth token from header (optional)
    const authToken = c.req.header('Authorization')?.replace('Bearer ', '');
    
    // Use userId from request or token
    const effectiveUserId = userId || authToken || `anon_${Date.now()}`;

    // Check rate limit for non-premium users
    if (!isPremium) {
      const { allowed, remaining } = rateLimiter.checkLimit(
        effectiveUserId,
        false
      );

      if (!allowed) {
        return c.json(
          {
            success: false,
            error: 'Limite diário atingido. Upgrade para Premium para continuar!',
            remaining: 0,
            isLimitReached: true,
          },
          429 // Too Many Requests
        );
      }

      console.log(
        `[LZ Chat] User ${effectiveUserId} has ${remaining} questions remaining today`
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

    return c.json({
      success: true,
      message: aiResponse,
      remaining: isPremium ? 999 : remaining,
      isLimitReached: !isPremium && remaining === 0,
    });
  } catch (error: any) {
    console.error('[LZ Chat API] Error:', error);

    // Handle specific OpenAI errors
    if (error.message?.includes('Rate limit')) {
      return c.json(
        {
          success: false,
          error: 'Rate limit atingido. Tente novamente em alguns instantes.',
        },
        429
      );
    }

    if (error.message?.includes('autenticação')) {
      return c.json(
        {
          success: false,
          error: 'Erro de autenticação com OpenAI. Verifique a configuração.',
        },
        500
      );
    }

    return c.json(
      {
        success: false,
        error: error.message || 'Erro ao processar sua mensagem. Tente novamente.',
      },
      500
    );
  }
});

/**
 * GET /api/lz-chat/health
 * Health check endpoint
 */
lzChatAPI.get('/health', async (c) => {
  const openAIHealthy = await lzChatService.healthCheck();
  const stats = rateLimiter.getStats();

  return c.json({
    success: true,
    status: openAIHealthy ? 'healthy' : 'degraded',
    openAI: {
      connected: openAIHealthy,
      model: 'gpt-4o-mini',
    },
    rateLimiter: {
      active: true,
      stats,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/lz-chat/limit/:userId
 * Check daily limit for a user
 */
lzChatAPI.get('/limit/:userId', (c) => {
  const userId = c.req.param('userId');
  const isPremium = c.req.query('isPremium') === 'true';

  const { allowed, remaining } = rateLimiter.checkLimit(userId, isPremium);

  return c.json({
    success: true,
    allowed,
    remaining: isPremium ? 999 : remaining,
    isLimitReached: !allowed,
    currentCount: rateLimiter.getCurrentCount(userId),
    maxLimit: isPremium ? 999 : 2,
  });
});

/**
 * POST /api/lz-chat/clear-history
 * Clear chat history (frontend manages history in AsyncStorage)
 */
lzChatAPI.post('/clear-history', async (c) => {
  const body = await c.req.json();
  const { userId } = body;

  if (!userId) {
    return c.json(
      {
        success: false,
        error: 'userId é obrigatório',
      },
      400
    );
  }

  console.log(`[LZ Chat] History cleared for user: ${userId}`);

  return c.json({
    success: true,
    message: 'Histórico de conversa limpo com sucesso!',
  });
});

export default lzChatAPI;
