FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl
# ---------------------------------------------------------

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate

COPY --from=builder /app/dist ./dist
COPY src/templates ./dist/templates

USER node

EXPOSE 8000

CMD ["npm", "start"]