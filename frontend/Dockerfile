# ── Etapa 1: build con Node ───────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── Etapa 2: servir con nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copiar la SPA compilada
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración nginx con proxy y SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
