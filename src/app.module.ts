import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ComplaintModule } from './complaint/complaint.module';
import { OtpModule } from './otp/otp.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configurations/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { NotifcationModule } from './notifcation/notifcation.module';

@Module({
  imports: [
    CategoryModule,
    ComplaintModule,
    OtpModule,
    UserModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    RefreshTokenModule,
    NotifcationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
