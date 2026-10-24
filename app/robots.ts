import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
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
    sitemap: "https://myconnecticutkids.com/sitemap.xml",
    host: "https://myconnecticutkids.com",
  };
}
