# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Serve stage ----------
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
