#!/bin/bash

# Copy to Server Script - kroniq.io Deployment
# Bu script gerekli dosyaları server'a kopyalar

SERVER="$1"
if [ -z "$SERVER" ]; then
    echo "Kullanım: $0 [user@server-ip]"
    echo "Örnek: $0 root@192.168.1.100"
    exit 1
fi

echo "=========================================="
echo "Activepieces Dosyaları Server'a Kopyalanıyor"
echo "Server: $SERVER"
echo "=========================================="

# Gerekli dosyalar
FILES=(
    "deploy-activepieces-safe.sh"
    "nginx-kroniq-dev.conf"
    "nginx-kroniq-unified.conf"
    "DEPLOYMENT_GUIDE.md"
    "cloudflare-api-fix.md"
    "test-api-direct.sh"
)

echo "Kopyalanacak dosyalar:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (bulunamadı)"
        exit 1
    fi
done

echo ""
echo "Dosyalar /tmp/ dizinine kopyalanıyor..."

# Dosyaları kopyala
scp "${FILES[@]}" "$SERVER:/tmp/"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Kopyalama Başarılı!"
    echo "=========================================="
    echo ""
    echo "Server'da çalıştırılacak komutlar:"
    echo ""
    echo "# 1. Server'a SSH bağlantısı"
    echo "ssh $SERVER"
    echo ""
    echo "# 2. Kurulum script'ini çalıştır"
    echo "cd /tmp"
    echo "chmod +x deploy-activepieces-safe.sh"
    echo "bash deploy-activepieces-safe.sh development"
    echo ""
    echo "# 3. Development nginx config'i aktif et"
    echo "sudo cp nginx-kroniq-dev.conf /etc/nginx/sites-available/kroniq.io"
    echo "sudo nginx -t && sudo systemctl reload nginx"
    echo ""
    echo "# 4. Cloudflare API sorununu çöz"
    echo "cat cloudflare-api-fix.md"
    echo ""
    echo "# 5. API test et (Cloudflare bypass)"
    echo "chmod +x test-api-direct.sh"
    echo "./test-api-direct.sh"
    echo ""
    echo "# 6. Deployment guide'ı kontrol et"
    echo "cat DEPLOYMENT_GUIDE.md"
    echo ""
    echo "=========================================="
    echo "ÖNEMLİ: Cloudflare API routing sorunu var!"
    echo "cloudflare-api-fix.md dosyasını okuyun"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "Kopyalama Başarısız!"
    echo "=========================================="
    echo ""
    echo "Olası nedenler:"
    echo "- SSH key konfigürasyonu"
    echo "- Network bağlantı sorunu"
    echo "- Server erişim izinleri"
    echo ""
    echo "Manuel kopyalama:"
    echo "scp deploy-activepieces-safe.sh nginx-kroniq-dev.conf nginx-kroniq-unified.conf DEPLOYMENT_GUIDE.md $SERVER:/tmp/"
    exit 1
fi