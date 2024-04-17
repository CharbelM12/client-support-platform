import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date } from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  isVip: boolean;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: false })
  isEmployee: boolean;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ type: Date })
  lockedUntil: Date;

  @Prop({ default: true })
  isActivated: boolean;
}

export const userSchema = SchemaFactory.createForClass(User);
userSchema.index({ email: 1 });
