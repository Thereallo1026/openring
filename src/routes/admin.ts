import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema, SiteSchema } from "../schemas";
import { AddSiteBodySchema, DeleteSiteBodySchema } from "../schemas/admin";
import type { Site } from "../types";
import { getSitesList, saveSitesList } from "../utils";

const admin = new OpenAPIHono<{ Bindings: Env }>();

// middleware
admin.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Unauthorized. Missing or invalid Authorization header",
      },
      401
    );
  }

  const token = authHeader.substring(7);
  const adminToken = c.env.ADMIN_TOKEN;

  if (!adminToken || token !== adminToken) {
    return c.json(
      {
        error: "Unauthorized. Invalid admin token",
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
  description: "Add a new site to the webring",
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
      description: "Unauthorized. Invalid or missing admin token",
    },
    409: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Site already exists in the webring",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Failed to add site",
    },
  },
});

admin.openapi(addSiteRoute, async (c) => {
  const body = c.req.valid("json");

  const site: Site = {
    url: body.url,
    name: body.name,
    image: body.image,
    description: body.description,
  };

  try {
    const list = await getSitesList(c.env.OPENRING_KV);
    const exists = list.sites.some((item) => item.url === site.url);
    if (exists) {
      return c.json(
        {
          error: "Site already exists in the webring",
        },
        409
      );
    }

    const updated = {
      sites: [...list.sites, site],
    };
    await saveSitesList(c.env.OPENRING_KV, updated);
    return c.json(site, 201);
  } catch {
    return c.json(
      {
        error: "Failed to add site",
      },
      500
    );
  }
});

const deleteSiteRoute = createRoute({
  method: "delete",
  path: "/admin/sites",
  tags: ["Admin"],
  summary: "Remove a site",
  description: "Remove a site from the webring",
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
      description: "Unauthorized. Invalid or missing admin token",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Site not found in webring",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Failed to remove site",
    },
  },
});

admin.openapi(deleteSiteRoute, async (c) => {
  const body = c.req.valid("json");

  try {
    const list = await getSitesList(c.env.OPENRING_KV);
    const index = list.sites.findIndex((item) => item.url === body.url);
    if (index === -1) {
      return c.json(
        {
          error: "Site not found in webring",
        },
        404
      );
    }

    const removed = list.sites[index];
    const updated = {
      sites: list.sites.filter((_, i) => i !== index),
    };
    await saveSitesList(c.env.OPENRING_KV, updated);
    return c.json(removed, 200);
  } catch {
    return c.json(
      {
        error: "Failed to remove site",
      },
      500
    );
  }
});

export default admin;
