import { Body, Controller, Get, Post } from "@nestjs/common";
import { IntegrationGateway } from "./integration.gateway";

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
  publishEvent(@Body() event: IntegrationEvent) {
    const peerScopes: Record<AuthorityScope, AuthorityScope> = {
      PRIVATE_FRIDAY: "PUBLIC_WORKFLOW",
      PUBLIC_WORKFLOW: "PRIVATE_FRIDAY",
    };

    const normalized = {
      ...event,
      destinationScope: peerScopes[event.sourceScope],
      deliveredAt: new Date().toISOString(),
    };

    this.gateway.publish(normalized);
    return normalized;
  }
}
