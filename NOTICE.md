# NOTICE: Strapi template

## Software deployed

| Component | Licence | Source |
|---|---|---|
| Strapi 5.63.0 (`@strapi/strapi`, `@strapi/plugin-users-permissions`, `@strapi/provider-upload-aws-s3`) | MIT for the core (© Strapi Solutions SAS); files under `ee/` folders are under Strapi's commercial licence and stay disabled without a licence key | npm, locked in `services/strapi/package-lock.json` |
| Project skeleton (`config/*`, `src/admin/app.example.js`, `jsconfig.json`, `favicon.png`, `public/robots.txt`) | MIT (© Strapi Solutions SAS) | `strapi/strapi` `packages/cli/create-strapi-app/templates/vanilla-js` at tag `v5.63.0`, adapted (Postgres only, proxy/URL settings, S3 provider, CSP for the bucket, admin flags) |
| node-postgres (`pg` 8.20.0) | MIT | npm |
| Node.js 22.23.5 (Alpine 3.23) | MIT and others | Docker Official Image `node:22.23.5-alpine3.23` |
| PostgreSQL 18 | PostgreSQL Licence | Railway's `postgres-ssl` image |

MIT licence text (Strapi): Copyright (c) 2015-present Strapi Solutions SAS. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

## Written for this template

- `services/strapi/Dockerfile`, `railway/start.js`, `railway/admin-bootstrap.js`, `src/index.js` (bootstrap hook), the sample `src/api/article` content type, `template.json`, `README.md`, `TEMPLATE.md`, this file. MIT, © 2026 the template author.
- The admin bootstrap uses Strapi's own admin services (`role.getSuperAdmin`, `user.create`, `user.resetPasswordByEmail`) the way Strapi's `admin:create-user` and `admin:reset-user-password` CLI commands do, with the same password rules.

## Upstream sources checked (2026-11-20, read only; nothing was executed locally)

- `strapi/strapi` at `v5.63.0`: `packages/cli/create-strapi-app/templates/vanilla-js/*`, `packages/cli/create-strapi-app/src/index.ts` (default dependencies), `src/utils/database.ts` (pg 8.20.0), `src/utils/engines.ts`, `packages/core/strapi/src/cli/commands/admin/create-user.ts` and `reset-user-password.ts`, `packages/providers/upload-aws-s3/src/index.ts` and `utils.ts` (ACL, private buckets, signed URLs).
- npm registry: dependency resolution for `package-lock.json` (`npm install --package-lock-only --ignore-scripts`; no package code was run).
- Docker Hub digest: `node:22.23.5-alpine3.23`.

## Market templates reviewed

`strapi` (repo `railwayapp-templates/strapi`, no licence), `e10OW1` (Strapi 5, repo `szilardkoppel/railway.app-strapi`), `directus-open-source-cms`: read for topology and variables only. Nothing was copied.

## Names and affiliation

Strapi is a trademark of Strapi Solutions SAS. This is a community template, not affiliated with or endorsed by Strapi.
