import { z } from "@hono/zod-openapi";

export const AddSiteBodySchema = z
  .object({
    url: z.url().openapi({
      example: "https://example.com",
      description: "Full URL of the site to add",
    }),
    name: z.string().openapi({
      example: "Example Site",
      description: "Display name of the site",
    }),
    image: z.url().optional().openapi({
      example: "https://example.com/banner.png",
      description: "Banner or avatar image URL (88x31)",
    }),
    description: z.string().optional().openapi({
      example: "A cool website",
      description: "Short description of the site",
    }),
  })
  .openapi({
    description: "Request body for adding a new site to the webring",
    example: {
      url: "https://example.com",
      name: "Example Site",
      image: "https://example.com/banner.png",
      description: "A cool website",
    },
  });

export const DeleteSiteBodySchema = z
  .object({
    url: z.url().openapi({
      example: "https://example.com",
      description: "Full URL of the site to remove",
    }),
  })
  .openapi({
    description: "Request body for removing a site from the webring",
    example: {
      url: "https://example.com",
    },
  });
