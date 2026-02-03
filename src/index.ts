import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { classifyRoute } from "@/routes/classify";
import { validateRoute } from "@/routes/validate";
import { metricsRoute } from "@/routes/metrics";

const app = new Hono().basePath("/api/v1");

app.use("*", cors());
app.use("*", logger());
app.use("*", prettyJSON());

app.get("/", (c) => {
  return c.json({
    name: "Takeat Desafio API - Classificador",
    version: "1.0.0",
    description:
      "API REST para classificação automática de mensagens de clientes de restaurantes",
    endpoints: {
      health: "GET /health",
      classify: "POST /classify",
      validate: "POST /validate",
      metrics: "GET /metrics",
    },
    categories: ["PEDIDO_CARDAPIO", "STATUS_ENTREGA", "RECLAMACAO", "ELOGIO", "OUTROS"],
    documentation: "Consulte o README.md e API.md para mais informações",
  });
});

app.get("/health", async (c) => {
  return c.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    service: "Classificador de Intenções - API",
    version: "1.0.0",
  });
});

app.route("/classify", classifyRoute);
app.route("/validate", validateRoute);
app.route("/metrics", metricsRoute);

const startServer = async () => {
  console.log("Iniciando servidor...");
  serve({
    fetch: app.fetch,
    port: 8080,
  });
};

startServer();
