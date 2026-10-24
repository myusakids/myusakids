import type { MetadataRoute } from "next";
import { getStateConfig } from "@/lib/state-context";

export default function robots(): MetadataRoute.Robots {
  const { domain } = getStateConfig();
  const origin = `https://${domain}`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/auth/",
          "/coming-soon",
          "/api/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
