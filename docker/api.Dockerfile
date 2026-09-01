# Node is fixed to the workspace runtime line; image digest is verified in the
# deployment rehearsal before an approved production release.
FROM node:22.23.1-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter contracts build && pnpm --filter config build && pnpm --filter db build && pnpm --filter api build

FROM node:22.23.1-alpine AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=app:app /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=app:app /app/packages ./packages
COPY --from=build --chown=app:app /app/infra/scripts/preflight-production.ts ./infra/scripts/preflight-production.ts
USER app
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
