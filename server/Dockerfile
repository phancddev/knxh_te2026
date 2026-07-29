FROM node:22.13.1-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--no-warnings

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/src ./src
COPY goiygoc.jpeg ./assets/goiygoc.jpeg
COPY goiy.jpeg ./assets/goiy.jpeg
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
