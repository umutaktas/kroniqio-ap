#!/bin/bash

# Test HTTP API (SSL olmadan) - Cloudflare proxy kapatıldıktan sonra
echo "=========================================="
echo "HTTP API Test - Cloudflare Proxy Disabled"
echo "=========================================="

echo ""
echo "1. Test HTTP API endpoint:"
echo "curl http://kroniq.io/api/v1/flags"
curl -v http://kroniq.io/api/v1/flags

echo ""
echo ""
echo "2. Test HTTP webhook endpoint:"
echo "curl http://kroniq.io/v1/flags"
curl -v http://kroniq.io/v1/flags

echo ""
echo ""
echo "3. Test frontend (HTTP):"
echo "curl http://kroniq.io"
curl -I http://kroniq.io

echo ""
echo "=========================================="
echo "HTTP Test Complete"
echo "=========================================="
echo ""
echo "Eğer HTTP çalışıyorsa:"
echo "1. API routing sorunu çözüldü"
echo "2. SSL sertifikası kurmak gerekiyor"
echo "3. Ya da Cloudflare'i Page Rules ile tekrar aktif et"