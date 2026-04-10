/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://myconnecticutkids.com",
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
