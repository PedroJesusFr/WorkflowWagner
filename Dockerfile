# ---------- Estágio 1: build (compila TypeScript) ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
RUN npm ci
COPY scripts ./scripts
COPY src ./src
COPY db ./db
RUN npm run build

# ---------- Estágio 2: runtime (somente JS compilado) ----------
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist/package.json /app/dist/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist/src ./src
COPY --from=build /app/dist/db ./db
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/server.js"]
