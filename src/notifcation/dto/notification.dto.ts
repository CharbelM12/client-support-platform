import { IsMongoId, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class NotificationDto {
  @IsString()
  text: string;

  @IsMongoId()
  senderId: mongoose.Types.ObjectId;

  @IsMongoId()
  receiverId: mongoose.Types.ObjectId;

  @IsMongoId()
  complaintId: mongoose.Types.ObjectId;
}
