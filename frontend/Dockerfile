# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for frontend
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend
RUN npm install

# Copy full repository so relative cross-module imports (e.g. ../../admin/...) resolve
WORKDIR /app
COPY . .

WORKDIR /app/frontend
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
