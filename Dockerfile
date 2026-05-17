FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY server.js ./
COPY public/ ./public/

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
