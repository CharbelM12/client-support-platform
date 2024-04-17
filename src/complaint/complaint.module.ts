import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Complaint, complaintSchema } from './complaint.model';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { SocketModule } from 'src/socket/socket.module';
import { ConfigModule } from '@nestjs/config';
import complaintConfig from './complaint.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Complaint.name, schema: complaintSchema },
    ]),
    CategoryModule,
    UserModule,
    SocketModule,
    ConfigModule.forRoot({ load: [complaintConfig] }),
  ],
  controllers: [ComplaintController],
  providers: [ComplaintService],
})
export class ComplaintModule {}
