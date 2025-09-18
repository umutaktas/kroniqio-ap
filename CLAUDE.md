# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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