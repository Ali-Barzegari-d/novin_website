# Node is pinned to the workspace runtime line. The final image contains only
# Next.js standalone output and the statically bundled, OFL-licensed font files.
FROM node:22.23.1-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_RELEASE_READY=false
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL NEXT_PUBLIC_RELEASE_READY=$NEXT_PUBLIC_RELEASE_READY
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
COPY packages/contracts ./packages/contracts
RUN pnpm --filter contracts build && pnpm --filter web build

FROM node:22.23.1-alpine AS runtime
ENV NODE_ENV=production PORT=3050 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=app:app /app/apps/web/public ./apps/web/public
USER app
EXPOSE 3050
CMD ["node", "apps/web/server.js"]
