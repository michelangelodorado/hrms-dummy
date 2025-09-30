FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .

# Dev server for simplicity (Vite) — suitable for demo
EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0","--strictPort","--port","5173"]

