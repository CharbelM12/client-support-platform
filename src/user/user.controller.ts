import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePassword,
  LoginDto,
  SignupDto,
  addCMSUserDto,
} from './dto/user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import mongoose from 'mongoose';
import { paginationQuery } from 'src/utils/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { IsEmployee } from 'src/decorator/isEmployee.decorator';
import { IsEmployeeGuard } from 'src/guards/isEmployee.guard';
import { IsAdmin } from 'src/decorator/isAdmin.decorator';
import { IsAdminGuard } from 'src/guards/isAdmin.guard';
import { Public } from 'src/decorator/public.decorator';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}
  @Public()
  @Post('signup')
  signup(@Body() reqBody: SignupDto) {
    return this.userService.signup(reqBody);
  }

  @Public()
  @Post('login')
  login(@Body() reqBody: LoginDto) {
    return this.userService.login(reqBody);
  }

  @Put('change-password')
  async changePassword(@Body() reqBody: ChangePassword, @Req() { userId }) {
    return await this.userService.changePassword(reqBody, userId);
  }

  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Put('activate/:userId')
  async activateUser(@Param('userId') userId: mongoose.Types.ObjectId) {
    return await this.userService.ActivateorDeactivateUser(
      userId,
      this.configService.get<boolean>('isActivated'),
    );
  }

  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Put('deactivate/:userId')
  async deactivateUser(@Param('userId') userId: mongoose.Types.ObjectId) {
    return await this.userService.ActivateorDeactivateUser(
      userId,
      this.configService.get<boolean>('isDeactivated'),
    );
  }

  @IsAdmin(true)
  @UseGuards(IsAdminGuard)
  @Post('/add/admin')
  async addAdmin(@Body() reqBody: addCMSUserDto) {
    return await this.userService.addCMSUser(
      reqBody,
      this.configService.get<string>('roles.admin'),
    );
  }

  @IsAdmin(true)
  @UseGuards(IsAdminGuard)
  @Post('/add/employee')
  async addEmployee(@Body() reqBody: addCMSUserDto) {
    return await this.userService.addCMSUser(
      reqBody,
      this.configService.get<string>('roles.employee'),
    );
  }
  @Public()
  @Post('/cms/login')
  async cmsLogin(@Body() reqBody: LoginDto) {
    return await this.userService.cmsLogin(reqBody);
  }

  @IsAdmin(true)
  @UseGuards(IsAdminGuard)
  @Put('/add/admin/:userId')
  async makeCmsAdmin(@Param('userId') userId: mongoose.Types.ObjectId) {
    return await this.userService.makeCMSUserAdmin(userId);
  }

  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Get('cms')
  async getCmsUsers(@Query() query: paginationQuery) {
    return await this.userService.getCMSUsers(
      query.page ||
        this.configService.get<number>('pagination.defaultValues.page'),
      query.limit ||
        this.configService.get<number>('pagination.defaultValues.limit'),
    );
  }

  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Get('cms/details/:userId')
  async getCmsUserDetails(@Param('userId') userId: mongoose.Types.ObjectId) {
    return await this.userService.getCMSUserDetails(userId);
  }
}
