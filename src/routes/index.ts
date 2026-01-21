import { OpenAPIHono } from "@hono/zod-openapi";
import admin from "./admin";
import navigation from "./navigation";

const routes = new OpenAPIHono<{ Bindings: Env }>();

routes.route("/", navigation);
routes.route("/", admin);

export default routes;
