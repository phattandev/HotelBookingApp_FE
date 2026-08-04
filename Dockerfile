# 1. Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy toàn bộ mã nguồn và build
COPY . .
RUN npm run build

# 2. Runtime stage
FROM nginx:alpine
# Copy file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files từ stage 1 sang thư mục html của nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
