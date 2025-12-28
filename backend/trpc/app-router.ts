import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { lzChatRouter } from "./routes/lz-chat";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  lzChat: lzChatRouter,
});

export type AppRouter = typeof appRouter;
