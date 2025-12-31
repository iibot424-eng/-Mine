# ANARCHY_OS - Minecraft Bot Control Dashboard

## Overview

This is a full-stack web application for controlling and monitoring a Minecraft bot. The system provides a cyberpunk-themed dashboard to manage bot connections to both Java and Bedrock Minecraft servers, with real-time status monitoring, chat functionality, and configurable automation features.

The bot supports:
- Java Edition (via mineflayer) and Bedrock Edition (via bedrock-protocol)
- Offline and Microsoft authentication
- Auto-farming, auto-defense, and auto-trade feature toggles
- Real-time log streaming and chat communication

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with a custom cyberpunk/hacker theme
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion
- **Build Tool**: Vite

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/`
- UI primitives in `client/src/components/ui/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **API Design**: REST API with Zod schema validation
- **Bot Libraries**: mineflayer (Java), bedrock-protocol (Bedrock)

The backend uses a modular structure:
- `server/index.ts` - Express app entry point
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database abstraction layer
- `server/bot.ts` - Minecraft bot manager singleton
- `server/db.ts` - Database connection

### Shared Code
- `shared/schema.ts` - Drizzle table definitions and Zod schemas
- `shared/routes.ts` - API route contracts with input/output types

### Data Flow
1. Frontend components use custom hooks (`use-bot.ts`, `use-logs.ts`)
2. Hooks call the REST API endpoints
3. Server routes validate input with Zod and call storage/bot methods
4. Database operations use Drizzle ORM
5. Bot status polling occurs every 2 seconds for real-time updates

### Database Schema
- `bot_config` - Single-row configuration table for server connection settings and feature toggles
- `bot_logs` - Append-only log table for chat, info, error, and warning messages

## External Dependencies

### Database
- **PostgreSQL** - Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle ORM** - Type-safe database queries and migrations
- **connect-pg-simple** - Session storage (available but not currently used)

### Minecraft Protocols
- **mineflayer** - Java Edition bot client library
- **bedrock-protocol** - Bedrock Edition bot client library

### Frontend Libraries
- **@tanstack/react-query** - Server state management and caching
- **framer-motion** - UI animations
- **date-fns** - Date formatting for logs
- **lucide-react** - Icon library

### Build & Development
- **Vite** - Frontend bundler with HMR
- **esbuild** - Server bundling for production
- **tsx** - TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (must be provisioned)