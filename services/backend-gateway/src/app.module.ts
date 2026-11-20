import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { IntegrationGateway } from "./integration.gateway";

@Module({
  controllers: [AppController],
  providers: [IntegrationGateway],
})
export class AppModule {}
