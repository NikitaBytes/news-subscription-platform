# Многоступенчатая сборка для оптимизации размера образа

# Этап 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и lock файлы
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Компилируем TypeScript
RUN npm run build

# Этап 2: Production образ
FROM node:20-alpine

WORKDIR /app

# Устанавливаем только production зависимости + tsx для seed
COPY package*.json ./
RUN npm ci --only=production && npm install tsx

# Копируем скомпилированный код и Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Порт приложения
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["node", "dist/server.js"]
