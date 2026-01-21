import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema, SitesListSchema } from "../schemas";
import {
  GetRandomQuerySchema,
  NavigationQuerySchema,
  NavigationResultSchema,
} from "../schemas/navigation";

const navigation = new OpenAPIHono<{ Bindings: Env }>();

const getNextRoute = createRoute({
  method: "get",
  path: "/next",
  tags: ["Navigation"],
  summary: "Get next site",
  description: "Get the next site in the webring after the specified URL",
  request: {
    query: NavigationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NavigationResultSchema,
        },
      },
      description: "Next site in the webring",
    },
    302: {
      description: "Redirect to the next site (when redirect=true)",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request - missing or invalid URL parameter",
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

navigation.openapi(getNextRoute, (c) => {
  const { url, redirect } = c.req.valid("query");

  if (redirect) {
    return c.redirect("https://example.com", 302);
  }

  return c.json({
    site: {
      url,
      name: "Next Site",
      description: "The next site in the ring",
    },
    position: 2,
    total: 10,
  });
});

const getPrevRoute = createRoute({
  method: "get",
  path: "/prev",
  tags: ["Navigation"],
  summary: "Get previous site",
  description: "Get the previous site in the webring before the specified URL",
  request: {
    query: NavigationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NavigationResultSchema,
        },
      },
      description: "Previous site in the webring",
    },
    302: {
      description: "Redirect to the previous site (when redirect=true)",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid request - missing or invalid URL parameter",
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

navigation.openapi(getPrevRoute, (c) => {
  const { url, redirect } = c.req.valid("query");

  if (redirect) {
    return c.redirect("https://example.com", 302);
  }

  return c.json({
    site: {
      url,
      name: "Previous Site",
      description: "The previous site in the ring",
    },
    position: 1,
    total: 10,
  });
});

const getRandomRoute = createRoute({
  method: "get",
  path: "/random",
  tags: ["Navigation"],
  summary: "Get random site",
  description: "Get a random site from the webring",
  request: {
    query: GetRandomQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NavigationResultSchema,
        },
      },
      description: "Random site from the webring",
    },
    302: {
      description: "Redirect to a random site (when redirect=true)",
    },
  },
});

navigation.openapi(getRandomRoute, (c) => {
  const { redirect } = c.req.valid("query");

  if (redirect) {
    return c.redirect("https://random-site.com", 302);
  }

  return c.json({
    site: {
      url: "https://random-site.com",
      name: "Random Site",
      description: "A randomly selected site",
    },
    position: 5,
    total: 10,
  });
});

const getListRoute = createRoute({
  method: "get",
  path: "/list",
  tags: ["Navigation"],
  summary: "List all sites",
  description: "Get a list of all sites in the webring",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SitesListSchema,
        },
      },
      description: "List of all sites in the webring",
    },
  },
});

navigation.openapi(getListRoute, (c) => {
  return c.json({
    sites: [
      {
        url: "https://example1.com",
        name: "Example Site 1",
        description: "First example site",
      },
      {
        url: "https://example2.com",
        name: "Example Site 2",
        description: "Second example site",
      },
    ],
  });
});

export default navigation;
