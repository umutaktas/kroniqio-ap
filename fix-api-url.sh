#!/bin/bash

# Fix API URL - Frontend'i /v1/ direkt çağıracak şekilde ayarla
echo "=========================================="
echo "Frontend API URL Fix"
echo "=========================================="

echo ""
echo "1. API URL değişikliği yapılıyor..."
echo "Değişiklik: /api/v1/ -> /v1/"

# API URL'yi değiştir
sed -i 's|export const API_URL = `${API_BASE_URL}/api`;|export const API_URL = `${API_BASE_URL}/v1`;|g' packages/react-ui/src/lib/api.ts

echo "✓ API URL değiştirildi"

echo ""
echo "2. Frontend rebuild ediliyor..."
pm2 stop ap-dev
npm run build:frontend
pm2 start ap-dev

echo ""
echo "=========================================="
echo "Frontend API URL Fix Complete"
echo "=========================================="
echo ""
echo "Test et:"
echo "curl https://kroniq.io/"
echo ""
echo "Artık frontend /v1/flags çağırmalı"