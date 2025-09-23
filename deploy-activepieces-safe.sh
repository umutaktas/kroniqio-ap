#!/bin/bash

# Activepieces Deployment Script - Safe Version with Error Handling
# Tek nginx config, farklı çalışma modları

set -e  # Exit on error
set -u  # Exit on undefined variable

# Check if running with bash
if [ -z "${BASH_VERSION:-}" ]; then
    echo "Bu script bash ile çalıştırılmalıdır!"
    echo "Kullanım: bash $0 [development|production]"
    exit 1
fi

# Enable pipefail if bash supports it
if [[ "${BASH_VERSION}" != "" ]]; then
    set -o pipefail  # Exit on pipe failure
fi

# Renkleri tanımla
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Trap errors
trap 'handle_error $? $LINENO' ERR

handle_error() {
    echo -e "${RED}=========================================="
    echo "HATA: Satır $2'de hata oluştu (Exit code: $1)"
    echo "==========================================${NC}"
    exit $1
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_warning "Root olarak çalıştırıyorsunuz. Güvenlik için normal kullanıcı önerilir."
        read -p "Devam etmek istiyor musunuz? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Parametreleri al
MODE="${1:-production}"  # Default: production
INSTALL_DIR="/var/www/kroniqio"
REPO_URL="https://github.com/umutaktas/kroniqio-ap.git"
BRANCH="fix/button-nesting-issue"
STATE_FILE="$INSTALL_DIR/.deployment-state"

echo -e "${BLUE}=========================================="
echo "Activepieces Deployment - $MODE Mode"
echo "==========================================${NC}"

# Root kontrolü
check_root

# State management - önceki kurulumları takip et
load_state() {
    if [ -f "$STATE_FILE" ]; then
        source "$STATE_FILE"
        log_info "Önceki kurulum durumu yüklendi"
        return 0
    fi
    return 1
}

save_state() {
    local key=$1
    local value=$2
    echo "export ${key}='${value}'" >> "$STATE_FILE"
}

check_state() {
    local key=$1
    if [ -f "$STATE_FILE" ]; then
        source "$STATE_FILE"
        # Bash indirect variable reference
        eval "local value=\${${key}:-}"
        if [ ! -z "$value" ]; then
            return 0
        fi
    fi
    return 1
}

# 1. Node.js 18+ kontrolü ve kurulum
install_nodejs() {
    log_info "Node.js kontrolü..."

    if check_state "NODEJS_INSTALLED"; then
        log_success "Node.js zaten kurulu (önceki kurulumdan)"
        return 0
    fi

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')

        if [ "$MAJOR_VERSION" -ge 18 ]; then
            log_success "Node.js $NODE_VERSION kurulu"
            save_state "NODEJS_INSTALLED" "true"
            save_state "NODE_VERSION" "$NODE_VERSION"
            return 0
        else
            log_warning "Node.js $NODE_VERSION kurulu ama 18+ gerekli"
        fi
    fi

    log_info "Node.js 18 kurulumu yapılıyor..."
    if curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
       sudo apt-get install -y nodejs build-essential; then
        log_success "Node.js kurulumu tamamlandı"
        save_state "NODEJS_INSTALLED" "true"
    else
        log_error "Node.js kurulumu başarısız!"
        return 1
    fi
}

# 2. PM2 kurulumu
install_pm2() {
    log_info "PM2 kontrolü..."

    if check_state "PM2_INSTALLED"; then
        log_success "PM2 zaten kurulu (önceki kurulumdan)"
        return 0
    fi

    if command -v pm2 &> /dev/null; then
        log_success "PM2 kurulu"
        save_state "PM2_INSTALLED" "true"
        return 0
    fi

    log_info "PM2 kurulumu yapılıyor..."
    if sudo npm install -g pm2; then
        log_success "PM2 kurulumu tamamlandı"
        save_state "PM2_INSTALLED" "true"
    else
        log_error "PM2 kurulumu başarısız!"
        return 1
    fi
}

# 3. SQLite kontrolü (opsiyonel)
install_sqlite() {
    log_info "SQLite kontrolü..."

    if check_state "SQLITE_INSTALLED"; then
        log_success "SQLite zaten kurulu (önceki kurulumdan)"
        return 0
    fi

    if command -v sqlite3 &> /dev/null; then
        log_success "SQLite kurulu"
        save_state "SQLITE_INSTALLED" "true"
        return 0
    fi

    log_info "SQLite kurulumu..."
    if sudo apt-get update && sudo apt-get install -y sqlite3 libsqlite3-dev; then
        log_success "SQLite kurulumu tamamlandı"
        save_state "SQLITE_INSTALLED" "true"
    else
        log_warning "SQLite kurulamadı, devam ediliyor..."
    fi
}

# 4. Redis kontrolü ve kurulum
install_redis() {
    log_info "Redis kontrolü..."

    if check_state "REDIS_INSTALLED"; then
        log_success "Redis zaten kurulu (önceki kurulumdan)"
        return 0
    fi

    if command -v redis-cli &> /dev/null; then
        log_success "Redis kurulu"

        # Redis çalışıyor mu kontrol et
        if redis-cli ping > /dev/null 2>&1; then
            log_success "Redis çalışıyor"
        else
            log_info "Redis başlatılıyor..."
            sudo systemctl start redis-server || log_warning "Redis başlatılamadı"
            sudo systemctl enable redis-server || log_warning "Redis enable edilemedi"
        fi

        save_state "REDIS_INSTALLED" "true"
        return 0
    fi

    log_info "Redis kurulumu..."
    if sudo apt-get install -y redis-server; then
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        log_success "Redis kurulumu tamamlandı"
        save_state "REDIS_INSTALLED" "true"
    else
        log_warning "Redis kurulamadı, MEMORY queue kullanılacak"
        return 1
    fi
}

# 4. Repository setup
setup_repository() {
    log_info "Repository kurulumu..."

    # İlk kurulum mu kontrol et
    if [ ! -d "$INSTALL_DIR" ]; then
        log_info "Yeni kurulum - dizin oluşturuluyor"

        if ! sudo mkdir -p "$INSTALL_DIR"; then
            log_error "Dizin oluşturulamadı: $INSTALL_DIR"
            return 1
        fi

        sudo chown "$USER:$USER" "$INSTALL_DIR"
        cd "$INSTALL_DIR"

        log_info "Repository klonlanıyor..."
        if git clone -b "$BRANCH" "$REPO_URL" .; then
            log_success "Repository klonlandı"
            save_state "REPO_CLONED" "true"
        else
            log_error "Repository klonlanamadı!"
            return 1
        fi
    else
        log_info "Mevcut kurulum bulundu - güncelleniyor"
        cd "$INSTALL_DIR"

        # Git durumunu kontrol et
        if [ -d ".git" ]; then
            # Uncommitted changes kontrolü
            if ! git diff --quiet || ! git diff --cached --quiet; then
                log_warning "Commit edilmemiş değişiklikler var!"
                read -p "Değişiklikleri stash'lemek ister misiniz? (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    git stash push -m "Auto stash before deployment $(date)"
                    log_success "Değişiklikler stash'lendi"
                fi
            fi

            log_info "Git güncelleniyor..."
            git fetch origin || log_warning "Fetch başarısız, devam ediliyor..."
            git checkout "$BRANCH" || log_warning "Checkout başarısız, devam ediliyor..."
            git pull origin "$BRANCH" || log_warning "Pull başarısız, devam ediliyor..."
            log_success "Repository güncellendi"
        else
            log_warning ".git dizini bulunamadı, güncelleme atlandı"
        fi
    fi
}

# 5. Environment dosyası
setup_environment() {
    log_info "Environment dosyası kontrolü..."

    if [ -f "$INSTALL_DIR/.env" ]; then
        log_success ".env dosyası mevcut"

        # Backup al
        cp "$INSTALL_DIR/.env" "$INSTALL_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
        log_info ".env dosyası yedeklendi"

        # Eksik değişkenleri kontrol et ve ekle
        if ! grep -q "AP_FRONTEND_URL" "$INSTALL_DIR/.env"; then
            echo "AP_FRONTEND_URL=https://kroniq.io" >> "$INSTALL_DIR/.env"
            log_info "AP_FRONTEND_URL eklendi"
        fi

        if ! grep -q "AP_WEBHOOK_URL" "$INSTALL_DIR/.env"; then
            echo "AP_WEBHOOK_URL=https://kroniq.io" >> "$INSTALL_DIR/.env"
            log_info "AP_WEBHOOK_URL eklendi"
        fi

        return 0
    fi

    log_info "Yeni .env dosyası oluşturuluyor..."

    # Güvenlik anahtarları oluştur
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    JWT_SECRET=$(openssl rand -hex 16)

    cat > "$INSTALL_DIR/.env" << EOF
# Activepieces Environment
# Generated: $(date)
AP_FRONTEND_URL=https://kroniq.io
AP_WEBHOOK_URL=https://kroniq.io
AP_ENCRYPTION_KEY=$ENCRYPTION_KEY
AP_JWT_SECRET=$JWT_SECRET
AP_DB_TYPE=SQLITE3
AP_EXECUTION_MODE=UNSANDBOXED
AP_QUEUE_MODE=MEMORY
AP_PIECES_SOURCE=FILE
AP_PIECES_SYNC_MODE=NONE
AP_TELEMETRY_ENABLED=false
AP_CACHE_PATH=$INSTALL_DIR/cache
AP_CONFIG_PATH=$INSTALL_DIR/config
AP_LOG_LEVEL=info
AP_ENVIRONMENT=$MODE
EOF

    log_success ".env dosyası oluşturuldu"
    log_warning "Güvenlik anahtarları otomatik oluşturuldu. Production için değiştirin!"

    save_state "ENV_CREATED" "true"
}

# 6. Dizinleri oluştur
create_directories() {
    log_info "Gerekli dizinler oluşturuluyor..."

    local dirs=("cache" "config" "logs")

    for dir in "${dirs[@]}"; do
        if [ ! -d "$INSTALL_DIR/$dir" ]; then
            if mkdir -p "$INSTALL_DIR/$dir"; then
                log_success "$dir dizini oluşturuldu"
            else
                log_error "$dir dizini oluşturulamadı"
                return 1
            fi
        else
            log_info "$dir dizini mevcut"
        fi
    done
}

# 7. Dependencies kurulumu
install_dependencies() {
    log_info "Dependencies kontrolü..."

    cd "$INSTALL_DIR"

    # package-lock.json değişmiş mi kontrol et
    if [ -f "package-lock.json" ] && check_state "DEPS_INSTALLED"; then
        # Son kurulum zamanını kontrol et
        if [ -f "$STATE_FILE" ]; then
            source "$STATE_FILE"
            if [ ! -z "${DEPS_INSTALL_TIME:-}" ]; then
                # package.json'ın son değişiklik zamanı
                PKG_MOD_TIME=$(stat -c %Y package.json 2>/dev/null || echo 0)

                if [ "$PKG_MOD_TIME" -lt "${DEPS_INSTALL_TIME:-0}" ]; then
                    log_success "Dependencies güncel"
                    return 0
                fi
            fi
        fi
    fi

    log_info "Dependencies kurulumu başlatılıyor..."

    # Clean install için node_modules'ı temizle (opsiyonel)
    if [ -d "node_modules" ] && [ ! -z "${CLEAN_INSTALL:-}" ]; then
        log_warning "node_modules temizleniyor..."
        rm -rf node_modules package-lock.json
    fi

    # npm install with retry
    local retry_count=0
    local max_retries=3

    while [ $retry_count -lt $max_retries ]; do
        if npm install; then
            log_success "Dependencies kuruldu"
            save_state "DEPS_INSTALLED" "true"
            save_state "DEPS_INSTALL_TIME" "$(date +%s)"
            return 0
        else
            retry_count=$((retry_count + 1))
            log_warning "npm install başarısız (Deneme $retry_count/$max_retries)"

            if [ $retry_count -lt $max_retries ]; then
                log_info "5 saniye sonra yeniden denenecek..."
                sleep 5
            fi
        fi
    done

    log_error "Dependencies kurulamadı!"
    return 1
}

# 8. PM2 Process Management
manage_pm2_process() {
    local app_name="$1"
    local config_file="$2"

    log_info "PM2 process yönetimi: $app_name"

    # Mevcut process'i kontrol et
    if pm2 list | grep -q "$app_name"; then
        log_info "Mevcut process durduruluyor: $app_name"
        pm2 delete "$app_name" 2>/dev/null || true
    fi

    # Yeni process başlat
    if pm2 start "$config_file"; then
        pm2 save
        log_success "PM2 process başlatıldı: $app_name"
    else
        log_error "PM2 process başlatılamadı: $app_name"
        return 1
    fi
}

# 9. Build Production
build_production() {
    log_info "Production build başlatılıyor..."

    # Check if already built
    if [ -d "dist" ] && check_state "PRODUCTION_BUILT"; then
        read -p "Production build mevcut. Yeniden build etmek ister misiniz? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Build atlandı"
            return 0
        fi
    fi

    log_info "Backend build ediliyor..."
    if npx nx run-many --target=build --projects=server-api --configuration production; then
        log_success "Backend build tamamlandı"
    else
        log_error "Backend build başarısız!"
        return 1
    fi

    log_info "Frontend build ediliyor..."
    if npx nx run-many --target=build --projects=react-ui; then
        log_success "Frontend build tamamlandı"
    else
        log_error "Frontend build başarısız!"
        return 1
    fi

    log_info "Production dependencies kurulumu..."
    cd dist/packages/server/api
    if npm install --production --force; then
        log_success "Production dependencies kuruldu"
    else
        log_warning "Production dependencies kurulumu kısmen başarısız"
    fi
    cd "$INSTALL_DIR"

    save_state "PRODUCTION_BUILT" "true"
    save_state "BUILD_TIME" "$(date +%s)"
}

# 10. Nginx setup
setup_nginx() {
    log_info "Nginx konfigürasyonu kontrolü..."

    if [ -f "/etc/nginx/sites-available/kroniq.io" ]; then
        log_success "Nginx konfigürasyonu mevcut"

        # Test nginx config
        if sudo nginx -t 2>/dev/null; then
            log_success "Nginx konfigürasyonu geçerli"
        else
            log_error "Nginx konfigürasyonu hatalı!"
            return 1
        fi

        return 0
    fi

    log_info "Nginx konfigürasyonu oluşturuluyor..."

    if [ ! -f "nginx-kroniq-unified.conf" ]; then
        log_error "nginx-kroniq-unified.conf dosyası bulunamadı!"
        return 1
    fi

    if sudo cp nginx-kroniq-unified.conf /etc/nginx/sites-available/kroniq.io && \
       sudo ln -sf /etc/nginx/sites-available/kroniq.io /etc/nginx/sites-enabled/; then

        if sudo nginx -t && sudo systemctl reload nginx; then
            log_success "Nginx konfigürasyonu tamamlandı"
            save_state "NGINX_CONFIGURED" "true"
        else
            log_error "Nginx konfigürasyonu test edilemedi!"
            return 1
        fi
    else
        log_error "Nginx konfigürasyonu kopyalanamadı!"
        return 1
    fi
}

# 11. Health check
perform_health_check() {
    log_info "Sistem sağlık kontrolü..."

    local retry_count=0
    local max_retries=10

    while [ $retry_count -lt $max_retries ]; do
        if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
            log_success "API health check başarılı"
            return 0
        fi

        retry_count=$((retry_count + 1))
        log_info "API henüz hazır değil... (Deneme $retry_count/$max_retries)"
        sleep 3
    done

    log_warning "API health check timeout!"
    return 1
}

# Main deployment flow
main() {
    # Create state file directory if needed
    if [ ! -d "$INSTALL_DIR" ]; then
        sudo mkdir -p "$INSTALL_DIR"
        sudo chown "$USER:$USER" "$INSTALL_DIR"
    fi

    # Load previous state
    load_state || log_info "İlk kurulum"

    # Step 1: System requirements
    install_nodejs || exit 1
    install_pm2 || exit 1
    install_sqlite || log_warning "SQLite opsiyonel, devam ediliyor"
    install_redis || log_warning "Redis kurulamadı, MEMORY queue kullanılacak"

    # Step 2: Repository
    setup_repository || exit 1

    # Step 3: Environment
    setup_environment || exit 1
    create_directories || exit 1

    # Step 4: Dependencies
    install_dependencies || exit 1

    # Step 5: Mode specific operations
    if [ "$MODE" = "development" ] || [ "$MODE" = "dev" ]; then
        log_info "=== DEVELOPMENT MODE ==="

        # PM2 development config
        cat > "$INSTALL_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [
    {
      name: 'ap-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '$INSTALL_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        AP_PORT: 8080
      },
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
      time: true,
      watch: false,
      autorestart: true
    }
  ]
}
EOF
        manage_pm2_process "ap-dev" "ecosystem.config.js" || exit 1

    elif [ "$MODE" = "production" ] || [ "$MODE" = "prod" ]; then
        log_info "=== PRODUCTION MODE ==="

        build_production || exit 1

        # PM2 production config
        cat > "$INSTALL_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [
    {
      name: 'ap-prod',
      script: './dist/packages/server/api/main.js',
      cwd: '$INSTALL_DIR',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--enable-source-maps',
      env: {
        NODE_ENV: 'production',
        AP_PORT: 8080
      },
      error_file: './logs/prod-error.log',
      out_file: './logs/prod-out.log',
      time: true,
      watch: false,
      autorestart: true,
      max_memory_restart: '2G'
    }
  ]
}
EOF
        manage_pm2_process "ap-prod" "ecosystem.config.js" || exit 1

    else
        log_error "Geçersiz mod: $MODE"
        echo "Kullanım: $0 [development|production]"
        exit 1
    fi

    # Step 6: Nginx
    setup_nginx || log_warning "Nginx konfigürasyonu başarısız, manuel kontrol gerekli"

    # Step 7: Health check
    perform_health_check || log_warning "Health check başarısız, logları kontrol edin"

    # Success message
    echo ""
    echo -e "${GREEN}=========================================="
    echo "Deployment Başarıyla Tamamlandı!"
    echo "Mode: $MODE"
    echo "==========================================${NC}"
    echo ""
    echo -e "${BLUE}Web: https://kroniq.io${NC}"
    echo -e "${BLUE}API: https://kroniq.io/api/v1/health${NC}"
    echo ""
    echo "PM2 Komutları:"
    echo "  Status: pm2 status"
    echo "  Logs: pm2 logs"
    echo "  Restart: pm2 restart all"
    echo ""
    echo "Mod değiştirme:"
    echo "  Development: $0 development"
    echo "  Production: $0 production"
    echo ""
    echo "State dosyası: $STATE_FILE"
    echo "Clean install için: CLEAN_INSTALL=1 $0 $MODE"
    echo ""
}

# Run main function
main "$@"