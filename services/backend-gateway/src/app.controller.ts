import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { IntegrationGateway, PublishedIntegrationEvent } from "./integration.gateway";

type AuthorityScope = "PRIVATE_FRIDAY" | "PUBLIC_WORKFLOW";

interface ScopeRequest {
  principalId: string;
  requestedScope: AuthorityScope;
}

interface IntegrationEvent {
  type:
    | "RouteChangeRequested"
    | "ExceptionTriggered"
    | "NewProspectDiscovered"
    | "TicketApproved"
    | "B2BVisitRequested";
  sourceScope: AuthorityScope;
  destinationScope: AuthorityScope;
  tenantId: string;
  payload: Record<string, unknown>;
}

interface VisitRequest {
  customerName: string;
  phone: string;
  projectId: string;
  message: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

const peerScopes: Record<AuthorityScope, AuthorityScope> = {
  PRIVATE_FRIDAY: "PUBLIC_WORKFLOW",
  PUBLIC_WORKFLOW: "PRIVATE_FRIDAY",
};

const integrationEventTypes = new Set<string>([
  "RouteChangeRequested",
  "ExceptionTriggered",
  "NewProspectDiscovered",
  "TicketApproved",
  "B2BVisitRequested",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuthorityScope(value: unknown): value is AuthorityScope {
  return value === "PRIVATE_FRIDAY" || value === "PUBLIC_WORKFLOW";
}

function isIntegrationEventType(
  value: unknown,
): value is IntegrationEvent["type"] {
  return typeof value === "string" && integrationEventTypes.has(value);
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function validateVisitRequest(value: unknown): VisitRequest {
  if (!isRecord(value) || !isRecord(value.location)) {
    throw new BadRequestException("A customer location is required");
  }

  const { customerName, phone, projectId, message, location } = value;
  const { latitude, longitude } = location;
  if (
    typeof customerName !== "string" ||
    !customerName.trim() ||
    customerName.length > 120 ||
    typeof phone !== "string" ||
    !phone.trim() ||
    phone.length > 40 ||
    typeof projectId !== "string" ||
    !["retail-operations", "distribution-network", "customer-services"].includes(
      projectId,
    ) ||
    (message !== undefined && typeof message !== "string") ||
    (typeof message === "string" && message.length > 1000) ||
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new BadRequestException("Visit request details are invalid");
  }

  return {
    customerName: customerName.trim(),
    phone: phone.trim(),
    projectId,
    message: typeof message === "string" ? message.trim() : "",
    location: { latitude, longitude },
  };
}

@Controller()
export class AppController {
  constructor(private readonly gateway: IntegrationGateway) {}

  @Get("health")
  health() {
    return {
      service: "friday-field-ops-gateway",
      status: "healthy",
    };
  }

  @Post("identity/scope")
  resolveScope(@Body() request: ScopeRequest) {
    if (
      request.requestedScope !== "PRIVATE_FRIDAY" &&
      request.requestedScope !== "PUBLIC_WORKFLOW"
    ) {
      return { authorized: false, scope: null };
    }

    return {
      authorized: true,
      principalId: request.principalId,
      scope: request.requestedScope,
      permissions: "FULL_SCOPED_AUTHORITY",
    };
  }

  @Post("gateway/events")
  async publishEvent(@Body() value: unknown) {
    if (
      !isRecord(value) ||
      !isIntegrationEventType(value.type) ||
      !isAuthorityScope(value.sourceScope) ||
      !isAuthorityScope(value.destinationScope) ||
      !isUuid(value.tenantId) ||
      !isRecord(value.payload)
    ) {
      throw new BadRequestException("Integration event is invalid");
    }

    return this.dispatchEvent({
      type: value.type,
      sourceScope: value.sourceScope,
      destinationScope: peerScopes[value.sourceScope],
      tenantId: value.tenantId,
      payload: value.payload,
    });
  }

  @Post("public/visit-requests")
  async requestVisit(@Body() value: unknown) {
    const request = validateVisitRequest(value);
    const tenantId = process.env.PUBLIC_TENANT_ID;
    if (!isUuid(tenantId)) {
      throw new ServiceUnavailableException(
        "Public tenant configuration is missing or invalid",
      );
    }

    return this.dispatchEvent({
      type: "B2BVisitRequested",
      sourceScope: "PUBLIC_WORKFLOW",
      destinationScope: peerScopes.PUBLIC_WORKFLOW,
      tenantId,
      payload: {
        leadId: randomUUID(),
        ...request,
        submittedAt: new Date().toISOString(),
      },
    });
  }

  private async dispatchEvent(event: IntegrationEvent) {
    const published: PublishedIntegrationEvent = {
      ...event,
      eventId: randomUUID(),
      deliveredAt: new Date().toISOString(),
    };
    await this.gateway.publish(published);
    return published;
  }
}
