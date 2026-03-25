# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/web-frontend/browser /usr/share/nginx/html
EXPOSE 8080
ENV API_GATEWAY_URL=http://api-gateway:8080
CMD ["nginx", "-g", "daemon off;"]
