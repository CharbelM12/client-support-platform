import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './user.model';
import { Email } from 'src/utils/email.utils';
import { JwtToken } from 'src/utils/jwt.utils';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { ConfigModule } from '@nestjs/config';
import userConfig from './user.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    JwtModule.register({
      global: true,
    }),
    RefreshTokenModule,
    ConfigModule.forRoot({
      cache: true,
      load: [userConfig],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, Email, JwtToken],
  exports: [UserService],
})
export class UserModule {}
