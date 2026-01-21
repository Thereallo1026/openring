import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import routes from "./routes";

const app = new OpenAPIHono<{ Bindings: Env }>();

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "Token",
  description: "Bearer token for admin endpoints.",
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "OpenRing API",
    version: "0.1.0",
    description: "An open-source webring API built with Cloudflare Workers",
  },
});

app.get(
  "/docs",
  Scalar({
    url: "/openapi.json",
    pageTitle: "OpenRing API Documentation",
    theme: "default",
  })
);

app.get("/", (c) => c.redirect("/docs"));

app.route("/", routes);

export default app;
