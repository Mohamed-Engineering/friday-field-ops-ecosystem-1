# Friday Field Operations agent instructions

## Repository map

- `apps/web-dashboard/`: Next.js 15 App Router command center. The authority views are `PRIVATE_FRIDAY` and `PUBLIC_WORKFLOW`.
- `apps/mobile-flutter/`: Flutter field operations application using Riverpod, GoRouter, Drift, Dio, geolocation, and Socket.IO dependencies.
- `services/backend-gateway/src/`: NestJS 11 API and integration bridge.
- `docs/database/schema.sql`: PostgreSQL/PostGIS schema and tenant-scoped spatial helpers.
- `docker-compose.yml`: local PostGIS and Redis dependencies.

Use the nearest existing package/workspace conventions. Work from the repository root unless a package-specific command requires otherwise.

## Architecture and authority model

- Preserve exactly these authority scopes: `PRIVATE_FRIDAY` and `PUBLIC_WORKFLOW`.
- Treat `services/backend-gateway/src/integration.gateway.ts` as the bridge between scopes. Integration events require `sourceScope`, `destinationScope`, `tenantId`, and a payload.
- The gateway computes the peer destination for an integration event. Do not add a cross-scope route that bypasses it.
- Keep tenant isolation explicit in SQL, API inputs, DTOs, and storage queries. Never introduce a cross-tenant read or write.
- Use the existing enum names across connected surfaces: `authority_scope`, `ticket_status`, `ticket_priority`, and `visit_status` in SQL; corresponding string unions and payload fields in TypeScript and Dart.
- Keep integration event names aligned unless a behavior change explicitly requires a new event: `RouteChangeRequested`, `ExceptionTriggered`, `NewProspectDiscovered`, `TicketApproved`, and `B2BVisitRequested`.
- Preserve the existing `/telemetry` Socket.IO namespace and `integration.event`, `gps.telemetry`, and `workflow.ticket` event names.
- Do not invent authentication or authorization behavior as a substitute for the existing scoped-authority model.

## Implementing changes

- Make the smallest complete change in the owning workspace.
- In Next.js, preserve App Router structure and strict TypeScript. Keep `"use client"` only on components that use client state or browser APIs. Reuse React state and Framer Motion patterns already in `apps/web-dashboard/app/page.tsx`.
- Preserve bilingual behavior (`en`/`ar`) and RTL/LTR layout switching. Set `dir` from the selected locale and keep mirrored controls and status indicators usable on both desktop and mobile widths.
- Reuse the existing dark, cyan, emerald, and amber tokens in `apps/web-dashboard/app/globals.css`. Preserve the `.glass`, portal, metric, map, and responsive patterns instead of introducing a separate visual system.
- In NestJS, use `@nestjs` controllers, modules, and providers. Keep routes below the global `api` prefix. Add route handlers in `services/backend-gateway/src/app.controller.ts` and keep real-time behavior in `services/backend-gateway/src/integration.gateway.ts`.
- Prefer existing NestJS payload interfaces and `Record<string, unknown>` payloads over untyped objects. Validate authority-scope values and tenant fields at integration boundaries.
- In Flutter, preserve Material 3, the dark cyan/emerald theme, Riverpod providers, and accessible field labels. Keep field workflows and scope terminology consistent with the web and gateway.
- For SQL and PostGIS changes, update `docs/database/schema.sql`. Preserve UUID defaults, tenant foreign keys, SRID 4326, geography/geometry types, and GiST indexes. Keep tenant predicates in spatial and non-spatial queries.
- Do not commit generated output, dependencies, secrets, environment files, or local database state. Respect `.gitignore`.

## Validation

Use Node.js 20 or newer.

- Install JavaScript dependencies with `npm install`.
- Start local PostgreSQL/PostGIS and Redis dependencies with `docker compose up -d`.
- Run the web app with `npm run dev:web`; build it with `npm run build:web`.
- Run the gateway with `npm run dev:gateway`; build it with `npm run build:gateway`.
- Run the smallest relevant build after code changes.

There is currently no JavaScript test script or formal Flutter test suite configured. Add focused tests in the owning package if test infrastructure is appropriate and behavior warrants them.

For Flutter changes, when Flutter/Dart is available, run:

- `dart format --output=none --set-exit-if-changed apps/mobile-flutter/lib`
- `cd apps/mobile-flutter && flutter analyze`
- `cd apps/mobile-flutter && flutter test` if tests are present or added.

## Review checklist

- Confirm every source and destination scope is one of the two declared authority scopes.
- Confirm API, gateway, web, mobile, and SQL changes agree on field names and event semantics.
- Confirm database access remains tenant scoped and spatial data uses SRID 4326.
- Preserve strict TypeScript and NestJS decorator/type safety; do not add `any`.
- After UI changes, check desktop and mobile layouts and preserve English/Arabic and LTR/RTL behavior.
