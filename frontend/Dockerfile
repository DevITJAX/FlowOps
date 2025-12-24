# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build argument for API URL
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with the API URL
RUN npm run build

# Production stage - use nginx for static files
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
