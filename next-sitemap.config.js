/** @type {import('next-sitemap').IConfig} */
// Note: multi-tenant deployments should rely on the dynamic app/sitemap.ts
// (per-request, per-host). This config exists for the build-time static
// sitemap fallback; set NEXT_PUBLIC_SITE_URL per environment to point it at
// the correct origin, or drop the postbuild hook entirely.
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://myconnecticutkids.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/coming-soon", "/submit"],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/coming-soon"] },
    ],
  },
};
