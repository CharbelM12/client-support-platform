import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtService } from '@nestjs/jwt';
import { NotifcationModule } from 'src/notifcation/notifcation.module';

@Module({
  imports: [NotifcationModule],
  providers: [SocketGateway, JwtService],
  exports: [SocketGateway],
})
export class SocketModule {}
