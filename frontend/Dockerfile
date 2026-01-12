# 1. Base stage (Dépendances communes)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# Installation propre pour CI/CD et Dev
RUN npm install

# 2. Development stage (Pour docker-compose local)
# On s'arrête ici pour le dev, on ne build PAS l'app
FROM base AS development
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]

# 3. Builder stage (Pour la prod uniquement)
FROM base AS builder
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
COPY . .
# Le build ne se lance que SI on cible cette étape ou la suivante
RUN npm run build

# 4. Production stage (Nginx)
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]