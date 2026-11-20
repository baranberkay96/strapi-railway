# Strapi 5 Headless CMS (Postgres, S3 Bucket): Railway template spec

## Listing

| Field | Value |
|---|---|
| Name | **Strapi 5 Headless CMS (Postgres, S3 Bucket)** |
| Description | Headless CMS with REST API, admin panel and media in a Railway Bucket. (70 chars) |
| Category | CMS |
| Tags | strapi, headless-cms, cms, rest-api, postgres, s3, nodejs, content-api |
| Icon | `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/strapi.svg` (200, image/svg+xml) |
| Repo | `baranberkay96/strapi-railway`, service root `/services/strapi` |

## Base market templates (checked 2026-11-20)

| Code | Name | Active / total | Stack | Problems |
|---|---|---|---|---|
| `strapi` | Strapi (Railway) | 2795 / 7676 | repo `railwayapp-templates/strapi`, Postgres 17, uploads volume | Admin registration open to the first visitor; uploads on a volume (single instance); `/admin` as healthcheck; repo has no licence |
| `e10OW1` | Strapi 5 | 294 / 900 | third-party repo, Postgres 18 | Uses `DATABASE_PUBLIC_URL` (TCP proxy, egress); Cloudinary variables; open admin registration |
| `directus-open-source-cms` | Directus | 10 / 13 | other product | — |

Kept: Strapi + Postgres topology, `secret()` for `APP_KEYS`/salts/JWT secrets, `HOST=::`, telemetry off.

## Improvements over market templates

1. **No claimable admin.** Strapi lets the first visitor register the super admin while none exists. The project's `bootstrap` hook (runs before the HTTP server opens) creates it from `ADMIN_EMAIL`/`ADMIN_PASSWORD`; if creation fails Strapi stops instead of opening registration.
2. **Stateless app service:** media in a private Railway Bucket through Strapi's official AWS S3 provider with signed URLs (`ACL: private`), CSP extended for the bucket host so the admin shows thumbnails.
3. **Strapi 5.63.0, Postgres 18,** exact dependency tree in `package-lock.json`, Node 22 image pinned by digest, multi-stage build (admin compiled at build time).
4. **Private database** (no TCP proxy), `proxy.koa=true` + `url` for correct HTTPS links and secure cookies behind Railway's edge.
5. **Deploy-form values never fail the deploy** (STANDARD 8.29): bad PORT/HOST/PUBLIC_URL fall back; an admin password Strapi would reject fails closed (random password, explained in the log).
6. **Admin password reset from variables** (`RESET_ADMIN_PASSWORD`), using Strapi's own `resetPasswordByEmail`.
7. **Cold-start safe:** waits up to 15 minutes for Postgres; `/_health` healthcheck (204).
8. **Sample `Article` content type** so the API, drafts and media can be tried immediately (the Content-Type Builder is locked in production).
9. Admin NPS and Enterprise promotion banners off.

## Pinned versions

| Component | Version | Released | Checked |
|---|---|---|---|
| `@strapi/strapi`, `@strapi/plugin-users-permissions`, `@strapi/provider-upload-aws-s3` | 5.63.0 | 2026-11-18 | 2026-11-20 |
| `pg` | 8.20.0 (as create-strapi-app 5.63.0) | — | 2026-11-20 |
| Node | `node:22.23.5-alpine3.23@sha256:6868d469…f475` | 2026-11-12 | 2026-11-20 |
| Postgres | `postgres-ssl:18.6@sha256:4fc833b4…c863` | Railway base | 2026-11-20 |

## Services

### Strapi

Repo build `/services/strapi` (Dockerfile). Public, `targetPort` 1337, `PORT=1337`, healthcheck `/_health` (900 s), restart `ON_FAILURE` ×10, no volume. Variables: `PUBLIC_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (secret 24 + `aA1` so Strapi's rules always hold), `ADMIN_FIRSTNAME`, `RESET_ADMIN_PASSWORD`, `APP_KEYS` (two secrets), `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`, `DATABASE_URL`, `S3_*` (Bucket references), `S3_SIGNED_URL_EXPIRES`, telemetry flags.

### Postgres, Bucket

Railway base Postgres (volume `/var/lib/postgresql/data`, private). Railway Bucket `Bucket`.

## Resource estimate

Measured on the test deploy (2026-11-20, idle after the checks): Strapi 132-139 MiB, Postgres 53-114 MiB, CPU < 0.01 vCPU.

| Service | Idle RAM | Typical RAM | CPU |
|---|---|---|---|
| Strapi | 135 MB | 400-700 MB | 0.01 idle, 0.2-1 under API load |
| Postgres | 100 MB | 150-400 MB | 0.01-0.1 |
| Bucket | — | — | storage billed per GB |

Estimated cost: idle ≈ $2-3/month; typical small site ≈ $6-10/month plus bucket storage. Minimum plan: Trial (runtime under 1 GB). The admin build runs on Railway's builders.

## Verification checklist

- [x] Both services SUCCESS; `/_health` 204 (admin panel build ≈ 26 s on Railway's builder).
- [x] Admin login at `/admin` with the generated credentials (`POST /admin/login` 200); the `secret()+"aA1"` password form renders correctly.
- [x] `/admin/register-admin` refused (400, admin exists); `/admin/init` hasAdmin true.
- [x] Upload to the media library → provider `aws-s3`, object in the Railway Bucket (`*.t3.storageapi.dev`).
- [x] Create and publish an Article with the uploaded cover through the REST API with a full-access API token; list returns it with a signed cover URL (`X-Amz-Signature`) that fetches 200 image/png; anonymous read 403.
- [x] Short `ADMIN_PASSWORD` (`abc`) in the deploy form: deploy SUCCESS, fail-closed warning logged.
- [ ] `RESET_ADMIN_PASSWORD=true` with a new password: not verified — Railway refused further deploys ("trial has expired") before the redeploy ran.

## Open questions

- Admin build memory on the builders of each plan is not documented by Railway.
