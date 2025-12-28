import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import lzChatAPI from "./lz-chat-api";

const app = new Hono();

app.use("*", cors());

// tRPC endpoint
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// REST API endpoint for LZ Chat
app.route("/api/lz-chat", lzChatAPI);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
