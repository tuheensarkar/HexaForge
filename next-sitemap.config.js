/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://hexa-forge.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  outDir: 'public',
}
