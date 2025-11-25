#!/bin/bash

# 🚀 Скрипт быстрого развёртывания News Subscription App
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем развёртывание News Subscription App..."
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен."
    exit 1
fi

echo "✅ Docker и Docker Compose найдены"
echo ""

# Шаг 1: Сборка фронтенда
echo "📦 Шаг 1/2: Сборка фронтенда..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Установка зависимостей фронтенда..."
    npm install
fi

echo "🔨 Компиляция React приложения..."
npm run build

cd ..
echo "✅ Фронтенд собран успешно"
echo ""

# Шаг 2: Запуск Docker Compose
echo "🐳 Шаг 2/2: Запуск Docker контейнеров..."

# Остановка старых контейнеров (если есть)
echo "🧹 Очистка старых контейнеров..."
docker-compose down 2>/dev/null || true

# Сборка и запуск
echo "🔨 Сборка образов..."
docker-compose build --no-cache

echo "🚀 Запуск сервисов..."
docker-compose up -d

# Ожидание готовности
echo ""
echo "⏳ Ожидание готовности сервисов..."
sleep 5

# Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

# Ожидание backend
echo ""
echo "⏳ Ожидание инициализации backend..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend готов!"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""
echo "================================================"
echo "✅ Развёртывание завершено успешно!"
echo "================================================"
echo ""
echo "🌐 Приложение доступно по адресам:"
echo ""
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:3000"
echo "   Adminer:   http://localhost:8080"
echo ""
echo "🔐 Тестовые учётные записи:"
echo ""
echo "   Администратор:"
echo "   Email: admin@news.app"
echo "   Пароль: admin123"
echo ""
echo "   Редактор:"
echo "   Email: editor@news.app"
echo "   Пароль: editor123"
echo ""
echo "   Подписчик:"
echo "   Email: user@news.app"
echo "   Пароль: user123"
echo ""
echo "================================================"
echo ""
echo "📋 Полезные команды:"
echo ""
echo "   Логи:           docker-compose logs -f"
echo "   Остановка:      docker-compose down"
echo "   Перезапуск:     docker-compose restart"
echo "   Статус:         docker-compose ps"
echo ""
echo "📖 Подробная документация: DEPLOYMENT.md"
echo ""
