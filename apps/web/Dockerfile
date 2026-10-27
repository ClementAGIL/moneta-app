# Built from the monorepo root (docker build -f apps/web/Dockerfile .): Vite build, then Caddy serves it and proxies /api.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY packages/shared/package.json packages/shared/
RUN npm ci -w @moneta/web -w @moneta/shared
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build -w @moneta/web

FROM caddy:2-alpine
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv
