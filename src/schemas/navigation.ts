import { z } from "@hono/zod-openapi";
import { SiteSchema } from "./index";

export const NavigationQuerySchema = z.object({
  url: z.url().openapi({
    param: {
      name: "url",
      in: "query",
    },
    example: "https://example.com",
    description: "Full URL of the current site in the webring",
  }),
  redirect: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .openapi({
      param: {
        name: "redirect",
        in: "query",
      },
      example: "false",
      description: "If true, returns 302 redirect instead of JSON",
    }),
});

export const GetRandomQuerySchema = z.object({
  exclude: z
    .url()
    .optional()
    .openapi({
      param: {
        name: "exclude",
        in: "query",
      },
      example: "https://example.com",
      description: "URL to exclude from random selection",
    }),
  redirect: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .openapi({
      param: {
        name: "redirect",
        in: "query",
      },
      example: "false",
      description: "If true, returns 302 redirect instead of JSON",
    }),
});

export const NavigationResultSchema = z
  .object({
    site: SiteSchema,
    position: z.number().int().positive().openapi({
      example: 1,
      description: "1-indexed position in the webring",
    }),
    total: z.number().int().positive().openapi({
      example: 10,
      description: "Total number of sites in the webring",
    }),
  })
  .openapi({
    description: "Navigation result with site information and position",
  });
