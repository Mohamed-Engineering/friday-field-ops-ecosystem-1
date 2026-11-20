# Friday Field Operations Ecosystem

Twin-instance field operations and workflow platform under one name and authority model.

## Workspaces

- `apps/web-dashboard` - Unified Next.js command center and workflow portal
- `apps/mobile-flutter` - Flutter field supervisor and workflow application
- `services/backend-gateway` - NestJS API, event gateway, Socket.IO telemetry, and integration bridge
- `docs/database` - PostgreSQL/PostGIS schema

## Local startup

```bash
npm install
npm run dev:web
```

Start PostgreSQL/PostGIS and Redis with:

```bash
docker compose up -d
```