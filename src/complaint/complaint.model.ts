import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type ComplaintDocument = mongoose.HydratedDocument<Complaint>;

@Schema({ timestamps: true, versionKey: false })
export class Complaint {
  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categoryIds: mongoose.Types.ObjectId[];

  @Prop({
    enum: ['PENDING', 'INPROGRESS', 'RESOLVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: mongoose.Types.ObjectId;
}

export const complaintSchema = SchemaFactory.createForClass(Complaint);

complaintSchema.index({ categoryIds: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdBy: 1 });
complaintSchema.index({ createdAt: -1 });
