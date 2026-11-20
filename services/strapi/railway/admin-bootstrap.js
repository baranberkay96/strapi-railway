'use strict';
// Railway template: first administrator and password reset from variables
// (written for this template, MIT). Rules follow Strapi's own admin CLI
// (packages/core/strapi/src/cli/commands/admin/create-user.ts, v5.63.0).

const crypto = require('node:crypto');

const log = (msg) => console.log(`[railway-admin] ${msg}`);
const warn = (msg) => console.error(`[railway-admin] WARNING: ${msg}`);

const EMAIL_RE = /^[^\s@"'<>()[\],;:\\]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

function passwordProblem(pw) {
  if (pw.length < 8) return 'shorter than 8 characters';
  if (Buffer.byteLength(pw) > 72) return 'longer than 72 bytes';
  if (!/[a-z]/.test(pw)) return 'without a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'without an uppercase letter';
  if (!/\d/.test(pw)) return 'without a digit';
  return null;
}

function randomPassword() {
  return `${crypto.randomBytes(24).toString('base64url')}aA1`;
}

function settings() {
  let email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    warn(`ADMIN_EMAIL='${email}' is not a valid e-mail address; using admin@example.com`);
    email = 'admin@example.com';
  }
  let firstname = String(process.env.ADMIN_FIRSTNAME || '').trim();
  if (!firstname || firstname.length > 100) firstname = 'Admin';

  let password = String(process.env.ADMIN_PASSWORD || '');
  const problem = passwordProblem(password);
  if (problem) {
    warn(`ADMIN_PASSWORD is ${problem}; Strapi requires 8-72 bytes with lower case, upper case and a digit.`);
    warn('Failing closed: a new install gets a random admin password nobody knows; an existing admin keeps');
    warn('the current password. Fix: set ADMIN_PASSWORD and RESET_ADMIN_PASSWORD=true on the Strapi');
    warn('service, redeploy, log in, then set RESET_ADMIN_PASSWORD=false.');
    password = randomPassword();
  }
  const reset = ['true', '1', 'yes'].includes(String(process.env.RESET_ADMIN_PASSWORD || '').toLowerCase());
  return { email, firstname, password, usable: !problem, reset };
}

async function ensureAdmin(strapi) {
  const cfg = settings();
  const users = strapi.db.query('admin::user');
  const count = await users.count();

  if (count === 0) {
    const superAdmin = await strapi.admin.services.role.getSuperAdmin();
    if (!superAdmin) throw new Error('Super Admin role not found; refusing to start with registration open.');
    // A failure here throws and stops Strapi: never open the public sign-up.
    await strapi.admin.services.user.create({
      email: cfg.email,
      firstname: cfg.firstname,
      lastname: '',
      isActive: true,
      blocked: false,
      roles: [superAdmin.id],
      password: cfg.password,
      registrationToken: null,
    });
    log(`created the super admin ${cfg.email}; log in at /admin with ADMIN_EMAIL and ADMIN_PASSWORD.`);
    return;
  }

  if (!cfg.reset) return;
  if (!cfg.usable) {
    warn('RESET_ADMIN_PASSWORD ignored: ADMIN_PASSWORD does not meet the rules above.');
    return;
  }
  const user = await users.findOne({ where: { email: cfg.email } });
  if (!user) {
    warn(`RESET_ADMIN_PASSWORD: no admin with e-mail ${cfg.email}; nothing changed.`);
    return;
  }
  await strapi.admin.services.user.resetPasswordByEmail(cfg.email, cfg.password);
  if (user.blocked || !user.isActive) {
    await users.update({ where: { id: user.id }, data: { blocked: false, isActive: true } });
  }
  log(`RESET_ADMIN_PASSWORD: password of ${cfg.email} set from ADMIN_PASSWORD. Set RESET_ADMIN_PASSWORD=false now.`);
}

module.exports = { ensureAdmin, passwordProblem };
