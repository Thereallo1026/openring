import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema, SiteSchema } from "../schemas";
import { AddSiteBodySchema, DeleteSiteBodySchema } from "../schemas/admin";

const admin = new OpenAPIHono<{ Bindings: Env }>();

admin.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Unauthorized - missing or invalid Authorization header",
        code: "MISSING_TOKEN",
      },
      401
    );
  }

  const token = authHeader.substring(7);
  const adminToken = c.env.ADMIN_TOKEN;

  if (!adminToken || token !== adminToken) {
    return c.json(
      {
        error: "Unauthorized - invalid admin token",
        code: "INVALID_TOKEN",
      },
      401
    );
  }

  await next();
});

const addSiteRoute = createRoute({
  method: "post",
  path: "/admin/sites",
  tags: ["Admin"],
  summary: "Add a site",
  description: "Add a new site to the webring (requires admin token)",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddSiteBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: SiteSchema,
        },
      },
      description: "Site successfully added",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request body",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Unauthorized - invalid or missing admin token",
    },
    409: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Site already exists in the webring",
    },
  },
});

admin.openapi(addSiteRoute, (c) => {
  const body = c.req.valid("json");

  return c.json(
    {
      url: body.url,
      name: body.name,
      image: body.image,
      description: body.description,
    },
    201
  );
});

const deleteSiteRoute = createRoute({
  method: "delete",
  path: "/admin/sites",
  tags: ["Admin"],
  summary: "Remove a site",
  description: "Remove a site from the webring (requires admin token)",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteSiteBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SiteSchema,
        },
      },
      description: "Site successfully removed",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request body",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Unauthorized - invalid or missing admin token",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Site not found in webring",
    },
  },
});

admin.openapi(deleteSiteRoute, (c) => {
  const body = c.req.valid("json");

  return c.json(
    {
      url: body.url,
      name: "Removed Site",
      description: "This site was removed",
    },
    200
  );
});

export default admin;
