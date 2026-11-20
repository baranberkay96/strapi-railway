# syntax=docker/dockerfile:1
#
# Strapi 5 for Railway: a plain Strapi 5.63.0 JavaScript project (created from
# Strapi's own "vanilla-js" starter, MIT) with Postgres, the AWS S3 upload
# provider pointed at a Railway Bucket, and an admin bootstrap
# (railway/admin-bootstrap.js). Dependencies are locked in package-lock.json.
ARG NODE_IMAGE=node:22.23.5-alpine3.23@sha256:6868d4695b947ee120bffaa463fecd68cde370d7bfec92955e7c8ac576b4f475

FROM ${NODE_IMAGE} AS build
WORKDIR /opt/app
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true
COPY package.json package-lock.json ./
# Exact versions from the lockfile; retries for flaky registry connections.
RUN npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000
COPY . .
# The admin panel (Vite) is compiled at build time. Builders have more memory
# than the runtime needs; cap the heap so a large build fails clearly.
RUN NODE_OPTIONS=--max-old-space-size=3072 npm run build \
 && node --check railway/start.js \
 && rm -rf .cache .tmp

FROM ${NODE_IMAGE}
WORKDIR /opt/app
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true \
    HOST=:: \
    PORT=1337
COPY --from=build --chown=node:node /opt/app /opt/app
USER node
EXPOSE 1337
# Railway's init is PID 1; railway/start.js forwards SIGTERM to Strapi.
CMD ["node", "railway/start.js"]
