#!/bin/bash

# Test API Direct Access - Bypass Cloudflare
# Bu script Cloudflare'i bypass ederek direkt server'a API test yapar

SERVER_IP="YOUR_SERVER_IP"  # Server IP'nizi buraya yazın
DOMAIN="kroniq.io"

echo "=========================================="
echo "API Test - Direct Server Access"
echo "=========================================="

echo ""
echo "1. Testing direct server IP (bypassing Cloudflare):"
echo "curl -H 'Host: kroniq.io' http://$SERVER_IP/v1/flags"
curl -H 'Host: kroniq.io' http://$SERVER_IP/v1/flags

echo ""
echo ""
echo "2. Testing direct server IP with /api/ path:"
echo "curl -H 'Host: kroniq.io' http://$SERVER_IP/api/v1/flags"
curl -H 'Host: kroniq.io' http://$SERVER_IP/api/v1/flags

echo ""
echo ""
echo "3. Testing localhost (from server):"
echo "ssh to server and run: curl http://localhost:3000/v1/flags"

echo ""
echo "=========================================="
echo "Cloudflare Bypass Test Complete"
echo "=========================================="
echo ""
echo "If direct IP works but domain doesn't:"
echo "- Cloudflare is intercepting requests"
echo "- Need to configure Cloudflare Page Rules"
echo "- Or temporarily disable proxy (gray cloud)"