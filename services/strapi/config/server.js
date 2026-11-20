// Strapi server settings for Railway. HOST/PORT/PUBLIC_URL are validated by
// railway/start.js before Strapi loads this file.
module.exports = ({ env }) => ({
  host: env('HOST', '::'),
  port: env.int('PORT', 1337),
  // Public URL (admin links, e-mails, OAuth callbacks). Empty = relative URLs.
  url: env('PUBLIC_URL', ''),
  // Railway's edge terminates TLS and sends X-Forwarded-* headers.
  proxy: { koa: true },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
