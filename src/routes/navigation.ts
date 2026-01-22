import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema, SitesListSchema } from "../schemas";
import {
  GetRandomQuerySchema,
  NavigationQuerySchema,
  NavigationResultSchema,
} from "../schemas/navigation";
import { getSitesList } from "../utils";

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

navigation.openapi(getNextRoute, async (c) => {
  const { url, redirect } = c.req.valid("query");
  const sitesList = await getSitesList(c.env.OPENRING_KV);
  const sites = sitesList.sites;

  if (sites.length === 0) {
    return c.json({ error: "Webring is empty" }, 404);
  }

  const currentIndex = sites.findIndex((site) => site.url === url);
  if (currentIndex === -1) {
    return c.json({ error: "Site not found in webring" }, 404);
  }

  const nextIndex = (currentIndex + 1) % sites.length;
  const nextSite = sites[nextIndex];

  if (redirect === true) {
    return c.redirect(nextSite.url, 302);
  }

  return c.json({
    site: nextSite,
    position: nextIndex + 1,
    total: sites.length,
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

navigation.openapi(getPrevRoute, async (c) => {
  const { url, redirect } = c.req.valid("query");
  const sitesList = await getSitesList(c.env.OPENRING_KV);
  const sites = sitesList.sites;

  if (sites.length === 0) {
    return c.json({ error: "Webring is empty" }, 404);
  }

  const currentIndex = sites.findIndex((site) => site.url === url);
  if (currentIndex === -1) {
    return c.json({ error: "Site not found in webring" }, 404);
  }

  const prevIndex = (currentIndex - 1 + sites.length) % sites.length;
  const prevSite = sites[prevIndex];

  if (redirect === true) {
    return c.redirect(prevSite.url, 302);
  }

  return c.json({
    site: prevSite,
    position: prevIndex + 1,
    total: sites.length,
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
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "No sites available in webring",
    },
  },
});

navigation.openapi(getRandomRoute, async (c) => {
  const { exclude, redirect } = c.req.valid("query");
  const sitesList = await getSitesList(c.env.OPENRING_KV);
  const sites = sitesList.sites;

  if (sites.length === 0) {
    return c.json({ error: "Webring is empty" }, 404);
  }

  const availableSites = exclude
    ? sites.filter((site) => site.url !== exclude)
    : sites;

  if (availableSites.length === 0) {
    return c.json({ error: "No other sites available in webring" }, 404);
  }

  const randomIndex = Math.floor(Math.random() * availableSites.length);
  const randomSite = availableSites[randomIndex];
  const originalIndex = sites.findIndex((site) => site.url === randomSite.url);

  if (redirect === true) {
    return c.redirect(randomSite.url, 302);
  }

  return c.json({
    site: randomSite,
    position: originalIndex + 1,
    total: sites.length,
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

navigation.openapi(getListRoute, async (c) => {
  const sitesList = await getSitesList(c.env.OPENRING_KV);
  return c.json(sitesList);
});

export default navigation;
