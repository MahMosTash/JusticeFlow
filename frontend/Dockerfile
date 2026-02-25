# Frontend Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install python and build tools for native modules (like node-gyp)
# Also install dependencies for canvas (cairo, pango, libjpeg, giflib, librsvg)
RUN apk add --no-cache \
    python3 make g++ \
    build-base cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

