🚀 Uygulama Çalıştırma Komutları

  Hızlı Başlangıç (Tümünü Çalıştır)

  # Dependencies kurulumu + tüm servisleri başlat
  npm start

  # Veya sadece servisleri başlat (dependencies zaten kuruluysa)
  npm run dev

  Ayrı Ayrı Çalıştırma

  Frontend (React UI)

  # Sadece frontend
  npm run serve:frontend

  # Frontend + Backend + Engine beraber
  npm run dev:frontend

  Backend (API Server)

  # Sadece backend API
  npm run serve:backend

  # Backend + Engine beraber
  npm run dev:backend

  Engine (Flow Execution)

  # Sadece engine
  npm run serve:engine

  Paralel Çalıştırma Kombinasyonları

  # Tümü (Frontend + Backend + Engine) - renkli output ile
  npm run dev

  # Backend + Engine (Frontend'siz)
  npm run dev:backend

  # Frontend + Backend + Engine
  npm run dev:frontend

  Port Bilgileri

  - Frontend: http://localhost:4200
  - Backend API: http://localhost:3000
  - Engine: WebSocket bağlantısı (otomatik)

  Environment Değişkenleri

  # .env dosyası oluştur (yoksa)
  cp .env.example .env

  # Gerekli minimum değişkenler .env'de:
  AP_ENGINE_EXECUTABLE_PATH=dist/packages/engine/main.js
  AP_POSTGRES_DATABASE=activepieces
  AP_POSTGRES_HOST=localhost
  AP_POSTGRES_PORT=5432
  AP_POSTGRES_USERNAME=postgres
  AP_POSTGRES_PASSWORD=A79Vm5D4p2VQHOp2gd5

  Docker ile Çalıştırma

  # Tüm servisleri Docker ile başlat
  docker-compose up

  # Arka planda çalıştır
  docker-compose up -d

  # Development mode
  docker-compose -f docker-compose.dev.yml up