import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './notification.model';
import { Model } from 'mongoose';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotifcationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async createNotification(notification: NotificationDto) {
    const savedNotification = await new this.notificationModel({
      text: notification.text,
      senderId: notification.senderId,
      receiverId: notification.receiverId,
      complaintId: notification.complaintId,
    }).save();
    return savedNotification.text;
  }
}
