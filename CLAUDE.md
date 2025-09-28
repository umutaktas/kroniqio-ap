# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Project: WhatsApp-SAP Integration

### Project Overview
Building a WhatsApp bot integration that:
1. Receives messages via WhatsApp Business API webhook at https://kroniq.io
2. Uses AI (OpenAI/Claude) to understand natural language queries in Turkish/English
3. Queries dummy SAP data tables (Stock, Customer Balance, Sales Orders)
4. Returns results as text or PDF reports based on user request

### Implementation Status
- [x] WhatsApp piece exists in `packages/pieces/community/whatsapp`
- [x] Basic webhook structure documented
- [x] SAP dummy tables creation using ActivePieces table system
- [x] AI-powered message handler implementation (Code pieces ready)
- [x] PDF report generation capability designed
- [x] Meta webhook configuration documentation complete
- [x] All TypeScript compilation errors fixed
- [x] Server running without errors
- [ ] Flow creation in ActivePieces UI (in progress)
- [ ] Meta Developer Console webhook configuration
- [ ] End-to-end testing with WhatsApp messages

### SAP Dummy Tables Structure
Using ActivePieces built-in table system (`packages/server/api/src/app/tables/`):

1. **Stock Table (sap_stok)**
   - malzeme_kodu (Material Code)
   - malzeme_adi (Material Name)
   - miktar (Quantity)
   - birim (Unit)
   - depo (Warehouse)
   - minimum_stok (Min Stock)

2. **Customer Balance Table (sap_musteri_bakiye)**
   - musteri_kodu (Customer Code)
   - musteri_adi (Customer Name)
   - borc (Debt)
   - alacak (Credit)
   - bakiye (Balance)
   - son_islem_tarihi (Last Transaction Date)

3. **Sales Orders Table (sap_satis_siparisleri)**
   - siparis_no (Order Number)
   - musteri_kodu (Customer Code)
   - musteri_adi (Customer Name)
   - siparis_tarihi (Order Date)
   - teslim_tarihi (Delivery Date)
   - toplam_tutar (Total Amount)
   - durum (Status)

### Example WhatsApp Queries
- "Stok durumu nedir?" → List all stock
- "MAL001 kodlu ürünün stoğu" → Specific stock query
- "Müşteri 12345 bakiyesi" → Customer balance
- "Bugünkü siparişler" → Today's orders
- "Rapor olarak gönder" → Send as PDF

### Meta Webhook Configuration
1. Webhook URL: `https://kroniq.io/v1/webhooks/{flow-id}`
2. Verify Token: `kroniq_sap_bot_2024`
3. Subscribe to: messages event

### Development Progress Summary (Session Checkpoint)

#### ✅ Completed Tasks:
1. **Project Architecture Analysis**: Analyzed ActivePieces structure and database entities
2. **SAP Dummy Data Script**: Created `sap-dummy-data-init.ts` with 3 tables (Stock, Customer, Orders)
3. **WhatsApp Flow Implementation**: Prepared 3 code pieces for flow:
   - Webhook verification handler
   - AI-powered SAP query processor
   - WhatsApp response sender
4. **Documentation**: Created comprehensive setup guides:
   - `whatsapp-sap-flow-setup.md` - Step-by-step flow creation
   - `meta-webhook-kroniq-setup.md` - Meta Developer Console setup
5. **Git Branch Management**: Created `whatsapp-development` branch with all changes
6. **Error Resolution**: Fixed all TypeScript compilation errors:
   - Field entity property mismatches
   - FieldType enum assignments
   - Database connection method calls
7. **Server Validation**: Confirmed server runs without errors

#### 📋 Current Status:
- **Server**: Running successfully on kroniq.io without compilation errors
- **Code**: All WhatsApp-SAP integration code completed and tested
- **Branch**: `whatsapp-development` with 4 commits pushed to GitHub
- **Next Step**: Create flow in ActivePieces UI using prepared code pieces

#### 🔄 Ready for Next Session:
- Flow creation guide: `whatsapp-sap-flow-setup.md`
- Meta configuration guide: `meta-webhook-kroniq-setup.md`
- All code pieces ready to copy-paste into ActivePieces flow
- SAP dummy data initialization script ready to run

#### 💡 Important Discovery:
- **Code piece** is available as built-in action (not trigger)
- **Location**: After creating trigger → Click "Add Action" → Search "Code"
- **Usage**: Add webhook trigger first, then add Code actions
- No custom Code piece implementation needed

## Common Development Commands

### Starting Development
```bash
# Install dependencies and run full dev environment (frontend + backend + engine)
npm start

# Run specific parts
npm run dev           # All services (frontend, backend, engine)
npm run dev:backend   # Backend + engine only
npm run dev:frontend  # Frontend + backend + engine

# Individual services
npm run serve:frontend  # React UI only
npm run serve:backend   # API server only
npm run serve:engine    # Flow execution engine only
```

### Working with Pieces (Integrations)
```bash
# Create a new piece
npm run create-piece

# Add action to existing piece
npm run create-action

# Add trigger to existing piece
npm run create-trigger

# Sync piece metadata
npm run sync-pieces

# Build piece for production
npm run build-piece

# Publish piece to API
npm run publish-piece-to-api
```

### Testing and Quality
```bash
# Run linting across all packages
nx run-many --target=lint

# Fix linting issues
nx run-many --target=lint --fix

# Run tests for a specific package
nx test [package-name]

# Run tests with coverage
nx test [package-name] --coverage

# Run e2e tests
nx e2e tests-e2e
```

### Building
```bash
# Build specific package
nx build [package-name]

# Build all packages
nx run-many --target=build
```

## High-Level Architecture

### Core Package Structure
- **`packages/server/api`** - Main backend API (Fastify-based)
- **`packages/react-ui`** - Frontend application (React + Vite + TailwindCSS)
- **`packages/engine`** - Flow execution engine (isolated-vm for secure code execution)
- **`packages/shared`** - Shared types, models, and utilities used across packages
- **`packages/pieces/community`** - All community-contributed integrations

### Flow Automation System
Flows consist of:
- **Trigger**: Entry point (webhook, schedule, or manual)
- **Actions**: Sequential steps with support for:
  - Conditional branching
  - Loops
  - Error handling with retries
  - Human-in-the-loop approvals

Flows are versioned (DRAFT vs LOCKED) with schema version 7 being current.

### Piece Framework
Pieces (integrations) follow a standardized structure:
- Located in `packages/pieces/community/[piece-name]`
- Each piece exports actions and triggers
- Built-in authentication support (OAuth2, API Key, etc.)
- TypeScript-based with full type safety
- Hot-reloading during development

### Database and Persistence
- **TypeORM** with PostgreSQL (production) or SQLite (development)
- **Multi-tenancy** via Projects (workspaces)
- **Key entities**: Flow, FlowVersion, FlowRun, User, Project, AppConnection

### Execution Engine
- **Isolated execution** using `isolated-vm` for security
- **WebSocket communication** between engine and server
- **Distributed workers** for scaling
- **Real-time progress tracking**

### Authentication & Multi-tenancy
- **JWT-based authentication**
- **Platform → Project → User** hierarchy
- **App Connections** scoped to projects
- Enterprise features: SAML SSO, MFA, RBAC

## Key Development Patterns

### When Adding New Features
1. Check existing patterns in similar features
2. Follow TypeScript strict mode requirements
3. Use existing UI components from `packages/react-ui/src/app/components`
4. Add proper types to `packages/shared/src/lib`
5. Follow the existing file structure conventions

### When Working with Pieces
1. Use the CLI to scaffold new pieces/actions/triggers
2. Follow existing authentication patterns
3. Include proper error handling
4. Add translations if applicable
5. Test locally with hot-reload before building

### Database Changes
1. Create migrations in the appropriate server package
2. Update entities in the shared package
3. Run migrations in development to test
4. Ensure backward compatibility

### Testing
1. Unit tests go alongside the code (`.test.ts` files)
2. E2E tests in `packages/tests-e2e`
3. Use existing test utilities and helpers
4. Mock external dependencies appropriately