import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import * as moment from 'moment';

export type RefreshTokenDocument = mongoose.HydratedDocument<RefreshToken>;

@Schema({ timestamps: true, versionKey: false })
export class RefreshToken {
  @Prop()
  refreshToken: string;

  @Prop()
  accessToken: string;

  @Prop({ type: Date, default: moment().add(86400, 's').toString() })
  expirationDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;
}

export const refreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ refreshToken: 1, expirationDate: 1 });
