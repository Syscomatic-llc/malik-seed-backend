# Stage 1: Build Angular app
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG API_BASE_URL=/api/v1
ARG MEDIA_BASE_URL=/
RUN sed -i \
    -e "s|apiBaseUrl: '/api/v1'|apiBaseUrl: '${API_BASE_URL}'|g" \
    -e "s|mediaBaseUrl: '/'|mediaBaseUrl: '${MEDIA_BASE_URL}'|g" \
    src/environments/environment.prod.ts

RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist/atlantis-ng/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
