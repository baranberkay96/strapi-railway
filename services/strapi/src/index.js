'use strict';

const { ensureAdmin } = require('../railway/admin-bootstrap');

module.exports = {
  register(/* { strapi } */) {},

  // Runs before the HTTP server opens: the first administrator is created
  // from ADMIN_EMAIL / ADMIN_PASSWORD, so the "create the first admin" page is
  // never open to visitors.
  async bootstrap({ strapi }) {
    await ensureAdmin(strapi);
  },
};
