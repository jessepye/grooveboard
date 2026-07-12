# Stage 1: compile TypeScript with dev dependencies, then prune them.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# Stage 2: runtime image — production deps and compiled JS only, non-root.
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3001
# node (not npm) as PID 1 so SIGTERM reaches the graceful-shutdown handler.
CMD ["node", "dist/index.js"]
