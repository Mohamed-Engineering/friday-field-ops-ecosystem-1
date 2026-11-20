import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/telemetry",
})
export class IntegrationGateway {
  @WebSocketServer()
  server!: Server;

  publish(payload: unknown) {
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
