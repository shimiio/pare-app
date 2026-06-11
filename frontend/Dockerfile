# Assemble
FROM node:22-alpine AS build
WORKDIR /app

# At first, only package.json for dependency caching
COPY package.json pnpm-lock.yaml ./

ENV CI=true
RUN npm install -g pnpm && pnpm install --frozen-lockfile --ignore-scripts

# Copy
COPY . .

# ENV
ARG VITE_API_BASE_URL
ARG VITE_CURRENCY_RATES_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CURRENCY_RATES_API_KEY=$VITE_CURRENCY_RATES_API_KEY

# Build
RUN pnpm build

# Distribute stats
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
