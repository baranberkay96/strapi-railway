# Deploy and Host Strapi with Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/strapi-5-headless-cms-postgres-s3-bucket?referralCode=20H68q)

Strapi is an open-source headless CMS: you model content types, editors manage content in the admin panel, and your apps read it through a REST API. This community template runs a Strapi 5 project with Postgres 18 on Railway, stores the media library in a Railway Bucket and creates the first super admin for you.

## About Hosting Strapi

A Strapi deployment is a Node.js project (your content types live in its code), a database and somewhere to keep uploaded files. This template builds a plain Strapi 5 JavaScript project from its own repository folder, connects it to Postgres over Railway's private network and points Strapi's official AWS S3 upload provider at a private Railway Bucket, so the Strapi service keeps no files and survives redeploys. The admin panel is compiled during the build. On the first start Strapi creates the super admin from the template variables before the server opens, so the "create the first administrator" page is never open to visitors.

## Common Use Cases

- Content backend for Next.js, Nuxt, Astro or mobile apps
- Marketing sites and blogs where editors work in a friendly admin panel
- Product catalogues, documentation and multi-language content
- Replacing a hosted CMS while keeping data in your own Postgres

## Dependencies for Strapi Hosting

- PostgreSQL (included, Postgres 18 with a volume)
- Railway Bucket for the media library (included)
- A fork of the template repository for your own content types

### Deployment Dependencies

- Strapi: https://strapi.io
- Source and releases: https://github.com/strapi/strapi
- Strapi 5 documentation: https://docs.strapi.io
- AWS S3 upload provider: https://www.npmjs.com/package/@strapi/provider-upload-aws-s3
- Railway Buckets: https://docs.railway.com/storage-buckets

### Implementation Details

| Service | Source | Purpose | Public | Storage |
|---|---|---|---|---|
| Strapi | repo build: Strapi 5.63.0 project on Node 22 | Admin panel, REST API, upload API | yes | Railway Bucket |
| Postgres | `postgres-ssl:18` | Content and users | no | volume |
| Bucket | Railway Bucket | Media library files (private, signed URLs) | no | bucket |

**First login**

1. Open the Strapi service's public URL and go to `/admin`.
2. Log in with `ADMIN_EMAIL` (default `admin@example.com`) and `ADMIN_PASSWORD` from the Strapi service's Variables tab.
3. Change the e-mail and password in your profile.

**Content types.** In production Strapi locks the Content-Type Builder: content types are code. The project ships one sample type, `Article` (title, slug, description, rich text, cover). To add your own, eject the template repository to your GitHub account (Railway offers this on the service), run `npm install` and `npm run develop` locally, build the types in the local admin, commit and push; Railway rebuilds and Strapi migrates the database on start.

**API access.** Content is private by default. Create an API token in Settings > API Tokens, or open specific actions to the public in Settings > Users & Permissions > Roles > Public.

**Media.** Files go to the Railway Bucket. Buckets are private, so Strapi returns signed URLs that expire after `S3_SIGNED_URL_EXPIRES` seconds (default 900). Fetch fresh URLs from the API rather than storing them. Without the Bucket variables Strapi falls back to local uploads, which a redeploy deletes.

**Admin password reset.** Set `ADMIN_PASSWORD` (8-72 characters with upper case, lower case and a digit) and `RESET_ADMIN_PASSWORD=true` on the Strapi service, redeploy, log in, then set it back to `false`. A password Strapi would reject never fails the deploy: a new install gets a random password nobody knows and the log explains this reset.

**E-mail.** Strapi sends no e-mail by default. Add an e-mail provider plugin that uses an HTTP API (for example SendGrid, Mailgun or Amazon SES) in your fork; SMTP works only on Railway Pro.

**Memory.** Strapi uses about 300-400 MB at runtime and fits Railway's Trial plan. The admin panel is built during the deploy (Vite); that needs more memory than the runtime and happens on Railway's builders.

**Scaling.** The Strapi service is stateless (files in the Bucket, data in Postgres), so you can add replicas once you put a cache or rate-limit store in front if needed.

**Versions and upgrades.** Strapi packages are pinned in `services/strapi/package.json` and `package-lock.json`. To upgrade, run `npx @strapi/upgrade minor` in your fork, commit the new lockfile and push. Back up Postgres first.

**Licence.** Strapi's core is MIT licensed; Enterprise features need a Strapi licence and are not enabled. This is a community template, not affiliated with Strapi Solutions SAS.

### Why Deploy Strapi on Railway?

Railway builds your Strapi project from Git, connects it privately to Postgres and a Bucket with generated secrets and HTTPS, and redeploys on every push, so content modelling stays in code while hosting stays simple.
