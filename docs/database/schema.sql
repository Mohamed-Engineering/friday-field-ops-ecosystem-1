CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE authority_scope AS ENUM ('PRIVATE_FRIDAY', 'PUBLIC_WORKFLOW');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');
CREATE TYPE visit_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'VERIFIED', 'EXCEPTION');

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  scope authority_scope NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  scope authority_scope NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, name)
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE field_supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  employee_code TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  UNIQUE (tenant_id, employee_code)
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  supervisor_id UUID REFERENCES field_supervisors(id),
  polygon geometry(Polygon, 4326),
  status TEXT NOT NULL DEFAULT 'PLANNED',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX routes_polygon_gix ON routes USING GIST (polygon);

CREATE TABLE gps_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  supervisor_id UUID NOT NULL REFERENCES field_supervisors(id),
  location geography(Point, 4326) NOT NULL,
  accuracy_m DOUBLE PRECISION,
  speed_kph DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  is_mock_location BOOLEAN NOT NULL DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX gps_telemetry_location_gix ON gps_telemetry USING GIST (location);
CREATE INDEX gps_telemetry_supervisor_time_idx ON gps_telemetry (supervisor_id, recorded_at DESC);

CREATE TABLE geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  area geography(Polygon, 4326) NOT NULL,
  radius_m DOUBLE PRECISION,
  enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX geofences_area_gix ON geofences USING GIST (area);

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  location geography(Point, 4326),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX shops_location_gix ON shops USING GIST (location);

CREATE TABLE shop_duplicates (
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  duplicate_shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  distance_m DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (shop_id, duplicate_shop_id)
);

CREATE TABLE visit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  route_id UUID REFERENCES routes(id),
  shop_id UUID REFERENCES shops(id),
  supervisor_id UUID NOT NULL REFERENCES field_supervisors(id),
  status visit_status NOT NULL DEFAULT 'PLANNED',
  check_in_location geography(Point, 4326),
  check_out_location geography(Point, 4326),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  live_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX visit_logs_location_gix ON visit_logs USING GIST (check_in_location);
CREATE INDEX visit_logs_tenant_status_idx ON visit_logs (tenant_id, status);

CREATE TABLE workflow_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  source_scope authority_scope NOT NULL,
  status ticket_status NOT NULL DEFAULT 'OPEN',
  priority ticket_priority NOT NULL DEFAULT 'NORMAL',
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type TEXT NOT NULL,
  source_scope authority_scope NOT NULL,
  destination_scope authority_scope NOT NULL,
  payload JSONB NOT NULL,
  delivered_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX integration_events_pending_idx
  ON integration_events (delivered_at, created_at);

CREATE OR REPLACE FUNCTION shops_within_meters(
  tenant UUID,
  point geography(Point, 4326),
  radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
  shop_id UUID,
  distance_m DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT s.id, ST_Distance(s.location, point)
  FROM shops s
  WHERE s.tenant_id = tenant
    AND s.location IS NOT NULL
    AND ST_DWithin(s.location, point, radius_meters)
  ORDER BY ST_Distance(s.location, point);
$$;
