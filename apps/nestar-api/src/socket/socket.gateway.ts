import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'tls';

@WebSocketGateway({transport: ['websocket'], secure: false})
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketGateway');
  private summaryClient: number = 0;
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized. Total clients: ' + this.summaryClient);
    // Initialization logic for the WebSocket gateway
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    this.summaryClient++;
    this.logger.log(`== Client connected. Total clients: ${this.summaryClient} ==`);
  }

  handleDisconnect(client: WebSocket) {
    this.summaryClient--;
    this.logger.log(`== Client disconnected. Total clients: ${this.summaryClient} ==`);
  }
  @SubscribeMessage('message')
  handleMessage(client: WebSocket, payload: any): string {
    return 'Hello world!';
  }
}
