import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    error: z.string().openapi({
      example: "Site not found in webring",
      description: "Error message describing what went wrong",
    }),
  })
  .openapi({
    description: "Standard error response format",
    example: {
      error: "Site not found in webring",
    },
  });

export const SiteSchema = z
  .object({
    url: z.url().openapi({
      example: "https://example.com",
      description: "Full URL of the site",
    }),
    name: z.string().openapi({
      example: "Example Site",
      description: "Display name of the site",
    }),
    image: z.url().optional().openapi({
      example: "https://example.com/banner.png",
      description: "Banner or avatar image URL",
    }),
    description: z.string().optional().openapi({
      example: "A cool website",
      description: "Short description of the site",
    }),
  })
  .openapi({
    description: "A site in the webring",
    example: {
      url: "https://example.com",
      name: "Example Site",
      image: "https://example.com/banner.png",
      description: "A cool website",
    },
  });

export const SitesListSchema = z
  .object({
    sites: z.array(SiteSchema).openapi({
      description: "Array of sites in the webring",
    }),
  })
  .openapi({
    description: "List of all sites in the webring",
    example: {
      sites: [
        {
          url: "https://example.com",
          name: "Example Site",
          image: "https://example.com/banner.png",
          description: "A cool website",
        },
      ],
    },
  });
