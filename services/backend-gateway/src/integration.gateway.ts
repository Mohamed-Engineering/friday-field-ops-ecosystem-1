import {
  BadGatewayException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

export interface PublishedIntegrationEvent {
  type:
    | "RouteChangeRequested"
    | "ExceptionTriggered"
    | "NewProspectDiscovered"
    | "TicketApproved"
    | "B2BVisitRequested";
  sourceScope: "PRIVATE_FRIDAY" | "PUBLIC_WORKFLOW";
  destinationScope: "PRIVATE_FRIDAY" | "PUBLIC_WORKFLOW";
  tenantId: string;
  payload: Record<string, unknown>;
  eventId: string;
  deliveredAt: string;
}

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/telemetry",
})
export class IntegrationGateway {
  @WebSocketServer()
  server!: Server;

  async publish(payload: PublishedIntegrationEvent): Promise<void> {
    if (payload.destinationScope === "PRIVATE_FRIDAY") {
      const webhookUrl = process.env.PRIVATE_INSTANCE_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new ServiceUnavailableException(
          "Private instance webhook is not configured",
        );
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const webhookToken = process.env.PRIVATE_INSTANCE_WEBHOOK_TOKEN;
      if (webhookToken) {
        headers.Authorization = `Bearer ${webhookToken}`;
      }

      let response: Response;
      try {
        response = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
      } catch (error) {
        throw new BadGatewayException(
          "Could not deliver integration event to the private instance",
          { cause: error },
        );
      }

      if (!response.ok) {
        throw new BadGatewayException(
          `Private instance webhook returned HTTP ${response.status}`,
        );
      }
    }

    this.server?.emit("integration.event", payload);
  }

  @SubscribeMessage("gps.telemetry")
  broadcastTelemetry(@MessageBody() payload: unknown) {
    this.server.emit("gps.telemetry", payload);
  }

  @SubscribeMessage("workflow.ticket")
  broadcastTicket(@MessageBody() payload: unknown) {
    this.server.emit("workflow.ticket", payload);
  }
}
