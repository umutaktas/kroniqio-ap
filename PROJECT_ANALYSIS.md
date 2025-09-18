# Activepieces Proje Analizi

## Proje Genel Bakış
Activepieces, Zapier'e açık kaynak alternatif olarak geliştirilmiş bir workflow automation platformu. TypeScript tabanlı, type-safe ve genişletilebilir bir mimari üzerine kurulu.

## Ana Teknolojiler

### Backend
- **Node.js** + **TypeScript**
- **Fastify**: Web framework
- **TypeORM**: ORM (PostgreSQL/SQLite desteği)
- **BullMQ**: Job queue (Redis ile)
- **Socket.IO**: WebSocket iletişimi
- **Isolated-VM**: Güvenli kod çalıştırma
- **JWT**: Authentication

### Frontend
- **React 18** + **TypeScript**
- **Zustand**: State management
- **TanStack Query**: Server state yönetimi
- **XYFlow**: Flow görselleştirme (eski adı React Flow)
- **Radix UI** + **TailwindCSS**: UI komponenetleri
- **React Hook Form** + **Zod**: Form yönetimi ve validasyon
- **React Router v6**: Routing

### Altyapı
- **Nx**: Monorepo yönetimi
- **Docker**: Containerization
- **Redis**: Cache ve job queue
- **PostgreSQL/SQLite**: Veritabanı

## Proje Yapısı

### Ana Paketler
```
packages/
├── server/
│   ├── api/          # Ana backend API sunucusu
│   ├── worker/       # Background job işleyicisi
│   └── shared/       # Server paketleri arası paylaşılan kod
├── react-ui/         # Frontend React uygulaması
├── engine/           # Flow execution engine
├── shared/           # Tüm paketler arası paylaşılan tipler ve utility'ler
├── cli/              # Geliştirici CLI aracı
├── pieces/           # Tüm entegrasyonlar (280+ piece)
│   └── community/
│       ├── framework/  # Piece geliştirme framework'ü
│       └── [pieces]/   # Her bir piece klasörü
├── ee/               # Enterprise Edition özellikleri
│   ├── shared/
│   └── ui/
└── tests-e2e/        # End-to-end testler
```

## Mimari Detaylar

### 1. Flow Sistemi
**Flow Yapısı:**
- **Flow**: Metadata, status, project ilişkisi
- **FlowVersion**: Trigger ve action tanımları (DRAFT vs LOCKED)
- **FlowRun**: Çalıştırma instance'ı ve sonuçları
- **Schema Version**: v7 (geriye dönük uyumluluk)

**Flow Bileşenleri:**
- Trigger (başlangıç noktası)
- Actions (sıralı adımlar)
- Branching (koşullu dallanma)
- Loops (döngüler)
- Error handling (hata yönetimi ve retry)

### 2. Piece Framework
**Piece Yapısı:**
```typescript
export const pieceExample = createPiece({
  displayName: 'Example Service',
  auth: PieceAuth.OAuth2({...}),
  actions: [action1, action2],
  triggers: [trigger1],
  logoUrl: '...',
  categories: [PieceCategory.MARKETING]
});
```

**Özellikler:**
- TypeScript tabanlı
- Hot-reloading desteği
- Çoklu auth metodları (OAuth2, API Key, Custom)
- Dinamik form oluşturma
- i18n desteği
- Metadata otomatik çıkarımı

### 3. Execution Engine
**Çalışma Prensibi:**
1. Trigger tetiklenir (webhook, schedule, manual)
2. Engine WebSocket üzerinden istek alır
3. Isolated-vm içinde güvenli çalıştırma
4. Real-time progress update
5. Sonuçların toplanması ve raporlama

**Özellikler:**
- İzole edilmiş çalıştırma ortamı
- Distributed worker desteği
- Real-time monitoring
- Error handling ve retry logic

### 4. Veritabanı Şeması

**Ana Tablolar:**
- `platform`: Multi-platform desteği
- `project`: Tenant isolation
- `user`: Kullanıcı yönetimi
- `flow`, `flow_version`, `flow_run`: Flow yönetimi
- `app_connection`: OAuth/API credentials
- `piece_metadata`: Piece bilgileri
- `trigger_event`: Trigger olayları

**Multi-tenancy:**
- Platform düzeyinde yapılandırma
- Project bazlı izolasyon
- User-Project many-to-many ilişkisi
- Role-based access control (Enterprise)

### 5. Authentication & Authorization
- JWT tabanlı authentication
- Refresh token mekanizması
- OAuth2 provider desteği
- SAML SSO (Enterprise)
- MFA (Enterprise)
- API key authentication
- Platform-specific OAuth apps

### 6. Frontend Mimarisi

**Component Yapısı:**
- Atomic design principles
- Radix UI primitive components
- Custom hooks for business logic
- Context providers (embedding, theme, telemetry)

**Flow Builder:**
- XYFlow (React Flow) tabanlı
- Drag-drop node ekleme
- Real-time collaboration ready
- Step-by-step testing
- AI Copilot entegrasyonu

**State Management:**
- Zustand: Local UI state
- TanStack Query: Server state ve caching
- React Hook Form: Form state

### 7. Backend API Yapısı

**Modüler Yapı:**
```
src/app/
├── authentication/    # Auth flows
├── flows/            # Flow CRUD
├── pieces/           # Piece yönetimi
├── projects/         # Multi-tenancy
├── users/            # User management
├── platform/         # Platform config
├── workers/          # Job processing
├── copilot/          # AI features
├── webhooks/         # Webhook handling
└── file/             # File storage
```

**Middleware Stack:**
- Authentication verification
- Rate limiting
- CORS handling
- Error handling
- Request logging
- Telemetry

### 8. Geliştirme Özellikleri

**CLI Komutları:**
- Piece oluşturma ve yönetim
- Action/Trigger ekleme
- Metadata senkronizasyonu
- Build ve publish işlemleri

**Development Experience:**
- Hot-reloading (frontend & pieces)
- TypeScript strict mode
- ESLint + Prettier
- Git hooks (Husky)
- Automated testing

## Kritik Noktalar

### Güvenlik
- Isolated VM execution
- JWT token rotation
- Input validation (Zod)
- SQL injection koruması
- XSS koruması
- Rate limiting

### Performans
- Redis caching
- Database indexing
- Lazy loading
- Code splitting
- WebSocket connection pooling

### Ölçeklenebilirlik
- Horizontal scaling (workers)
- Redis job queue
- Distributed locking
- Multi-database support
- CDN ready static assets

## Enterprise vs Community

### Community Edition
- Temel özellikler
- Sınırsız flow ve execution
- Community pieces
- Self-hosted

### Enterprise Edition
- SAML SSO
- MFA
- RBAC
- Audit logs
- Custom branding
- Priority support
- Enterprise pieces

## Deployment

### Docker
- Production-ready Dockerfile
- Docker Compose configurations
- Environment variable based config

### Kubernetes
- Helm chart support (community maintained)
- Horizontal pod autoscaling ready
- ConfigMap ve Secret yönetimi

## Önemli Dosyalar
- `.env.example`: Environment variable template
- `nx.json`: Monorepo configuration
- `tsconfig.base.json`: TypeScript base config
- `docker-compose.yml`: Local development setup
- `package.json`: Dependencies ve scripts