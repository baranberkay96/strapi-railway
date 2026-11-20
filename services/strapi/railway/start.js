'use strict';
// Start Strapi on Railway (written for this template, MIT).
//  - Deploy-form values never fail the deploy (STANDARD 8.29): PORT, HOST and
//    PUBLIC_URL fall back to safe values with a warning.
//  - Waits up to 15 minutes for Postgres (services start in parallel).
//  - Then runs `strapi start` and forwards SIGTERM to it.
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const log = (msg) => console.log(`[railway-start] ${msg}`);
const warn = (msg) => console.error(`[railway-start] WARNING: ${msg}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  if (process.env.PORT) warn(`PORT='${process.env.PORT}' is not a port number; using 1337`);
  process.env.PORT = '1337';
}
if (!process.env.HOST || !/^[0-9a-fA-F:.]+$/.test(process.env.HOST)) {
  if (process.env.HOST) warn(`HOST='${process.env.HOST}' is not an IP address; using ::`);
  process.env.HOST = '::';
}
if (process.env.PUBLIC_URL) {
  try {
    const u = new URL(process.env.PUBLIC_URL);
    if (!/^https?:$/.test(u.protocol) || !u.hostname || u.hostname === 'undefined') throw new Error('bad');
    process.env.PUBLIC_URL = u.toString().replace(/\/$/, '');
  } catch {
    warn(`PUBLIC_URL='${process.env.PUBLIC_URL}' is not an http(s) URL; using relative URLs.`);
    delete process.env.PUBLIC_URL;
  }
}
for (const name of ['APP_KEYS', 'ADMIN_JWT_SECRET', 'API_TOKEN_SALT', 'TRANSFER_TOKEN_SALT', 'JWT_SECRET', 'ENCRYPTION_KEY']) {
  if (!process.env[name]) warn(`${name} is empty; Strapi refuses to start without it. Set it on the Strapi service.`);
}

function canConnect(host, p) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: p, timeout: 4000 });
    const done = (ok) => { socket.destroy(); resolve(ok); };
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

async function waitForDatabase() {
  let target;
  try {
    target = new URL(process.env.DATABASE_URL || '');
  } catch {
    warn('DATABASE_URL is missing or invalid; Strapi will fail to connect.');
    return;
  }
  const host = target.hostname.replace(/^\[|\]$/g, '');
  const p = Number(target.port || 5432);
  const started = Date.now();
  for (let i = 0; !(await canConnect(host, p)); i++) {
    if (Date.now() - started > 15 * 60 * 1000) {
      warn(`Postgres at ${host}:${p} not reachable after 15 minutes; starting Strapi anyway.`);
      return;
    }
    if (i % 6 === 0) log(`waiting for Postgres at ${host}:${p} ...`);
    await sleep(5000);
  }
  log(`Postgres at ${host}:${p} is reachable.`);
}

(async () => {
  await waitForDatabase();
  const bin = path.join(__dirname, '..', 'node_modules', '.bin', 'strapi');
  log(`starting Strapi on [${process.env.HOST}]:${process.env.PORT}`);
  const child = spawn(bin, ['start'], { stdio: 'inherit', env: process.env, cwd: path.join(__dirname, '..') });
  for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => child.kill(sig));
  child.on('exit', (code, signal) => {
    log(`Strapi exited (${signal || code})`);
    process.exit(code === null ? 1 : code);
  });
})();
