import type { ClassificationRequest } from "@/lib/types";

import { Hono } from "hono";
import { classifyMessage, testGeminiConnection } from "@/services/gemini-service";

export const classifyRoute = new Hono();

/**
 * GET /health
 * Health check da API
 */

classifyRoute.get("/health", async (c) => {
  const isConnected = await testGeminiConnection();

  return c.json({
    status: isConnected ? "ok" : "error",
    timestamp: new Date().toISOString(),
    service: "Classificador de Intenções - API",
    version: "1.0.0",
  });
});

/**
 * POST /classify
 * Classifica uma mensagem simples
 */

classifyRoute.post("/", async (c) => {
  try {
    const { message } = await c.req.json<ClassificationRequest>();

    if (!message || message.trim() === "") {
      return c.json(
        {
          error: "Erro de validação: mensagem vazia",
          message: 'O campo "message" é obrigatório e não pode ser vazio.',
        },
        400
      );
    }

    const result = await classifyMessage(message);

    return c.json(result);
  } catch (error) {
    console.log("Erro no endpoint /classify:", error);

    return c.json(
      {
        error: "Internal Server Error",
        message: "Erro ao classificar mensagem",
      },
      500
    );
  }
});
