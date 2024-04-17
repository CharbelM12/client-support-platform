import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type OtpDocument = mongoose.HydratedDocument<Otp>;

@Schema({ timestamps: true, versionKey: false })
export class Otp {
  @Prop()
  otpType: string;
  @Prop()
  otp: number;
  @Prop({ type: Date })
  otpExpires: Date;
  @Prop({ type: Date })
  otpLastSendDate: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;
  @Prop({ default: 0 })
  retryCount: number;
  @Prop()
  verificationToken: string;
}
export const otpSchema = SchemaFactory.createForClass(Otp);
otpSchema.index({ userId: 1 });
otpSchema.index({ otp: 1, verificationToken: 1, otpExpires: 1 });
