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
ARG API_INTERNAL_URL=http://api:4000
ARG APP_ENV=production
ARG DEV_SMS_INBOX_ENABLED=false
ARG PUBLIC_BASE_URL=https://karafintech.ir
ENV API_INTERNAL_URL=$API_INTERNAL_URL APP_ENV=$APP_ENV DEV_SMS_INBOX_ENABLED=$DEV_SMS_INBOX_ENABLED NEXT_PUBLIC_BASE_URL=$PUBLIC_BASE_URL
RUN pnpm build

FROM node:22.23.1-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=build --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/web/public ./apps/web/public
USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
