# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS dependencies
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json ./backend/
COPY database/prisma ./database/prisma
RUN cd backend && npm ci --ignore-scripts && npm run prisma:generate

FROM dependencies AS build
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src
RUN cd backend && npm run build

FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache openssl wget dumb-init && addgroup -S routewell && adduser -S routewell -G routewell
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
COPY --from=dependencies /app/database/prisma ./database/prisma
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
RUN chmod +x ./backend/docker-entrypoint.sh && chown -R routewell:routewell /app
USER routewell
EXPOSE 8080
ENTRYPOINT ["/usr/bin/dumb-init", "--", "/app/backend/docker-entrypoint.sh"]
