# Friday Public Instance

Public-facing Friday instance for the projects and applications gallery and customer
visit requests. The private rep-tracking interface is not part of this application.

## Workspaces

- `apps/web-dashboard` - Next.js public gallery and visit-request form
- `services/backend-gateway` - NestJS API and integration bridge
- `docs/database` - PostgreSQL/PostGIS schema

## Local startup

```bash
npm install
npm run dev:web
```

Start the gateway in another terminal:

```bash
npm run dev:gateway
```

The web server proxies form submissions to `GATEWAY_API_URL` (defaults to
`http://localhost:3001/api`). The gateway requires `PUBLIC_TENANT_ID` to identify
the public tenant and `PRIVATE_INSTANCE_WEBHOOK_URL` to deliver visit leads to
the private instance. Set the webhook URL to the private instance's integration
receiver; it must accept the JSON integration-event envelope and return a 2xx
response only after accepting the event. If the receiver requires a bearer token,
set `PRIVATE_INSTANCE_WEBHOOK_TOKEN`. Missing configuration or a failed delivery
is returned as an error rather than a successful request.

Visit requests are sent as `B2BVisitRequested` integration events from
`PUBLIC_WORKFLOW` to `PRIVATE_FRIDAY`; the gateway determines the destination
scope. The payload includes a lead ID, customer contact details, project ID,
customer coordinates, and submission time. Use HTTPS for deployed webhook URLs
and serve the public site over HTTPS so browser location access is available.
