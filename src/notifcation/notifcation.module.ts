import { Module } from '@nestjs/common';
import { NotifcationService } from './notifcation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, notificationSchema } from './notification.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: notificationSchema },
    ]),
  ],
  controllers: [],
  providers: [NotifcationService],
  exports: [NotifcationService],
})
export class NotifcationModule {}
