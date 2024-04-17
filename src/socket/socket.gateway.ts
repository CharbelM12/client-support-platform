import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { NotifcationService } from 'src/notifcation/notifcation.service';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationDto } from 'src/notifcation/dto/notification.dto';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  crossOriginIsolated: true,
})
export class SocketGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  socketMap = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotifcationService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.server.on('connection', async (socket) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        socket.disconnect(true);
        return;
      }
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('tokens.accessTokenSecret'),
      });
      this.socketMap.set(payload.userId.toString(), socket.id);
      socket.on('disconnect', () => {
        this.socketMap.delete(socket.id);
      });
    });
  }

  async emitNotification(userId: string, notification: NotificationDto) {
    const socketId = this.socketMap.get(userId);
    const createdNotification =
      await this.notificationService.createNotification(notification);
    this.server.to(socketId).emit('notification', createdNotification);
  }
}
