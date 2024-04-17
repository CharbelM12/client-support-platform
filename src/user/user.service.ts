import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User } from './user.model';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChangePassword,
  LoginDto,
  SignupDto,
  addCMSUserDto,
} from './dto/user.dto';
import { SHA256 } from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as randomString from 'randomstring';
import { Email } from 'src/utils/email.utils';
import { JwtToken } from 'src/utils/jwt.utils';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import errorMessages from 'errorMessages';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly emailSender: Email,
    private readonly jwtToken: JwtToken,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}
  async signup(reqBody: SignupDto) {
    const user = await this.userModel.findOne({ email: reqBody.email });
    if (user) {
      throw new ConflictException();
    }
    await new this.userModel({
      email: reqBody.email,
      password: SHA256(reqBody.password).toString(),
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
      isVip: reqBody.isVip,
    }).save();
  }

  async login(reqBody: LoginDto) {
    const user = await this.userModel.findOne({ email: reqBody.email });
    if (!user) {
      throw new HttpException(
        errorMessages.incorrectCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    } else if (user.isAdmin || user.isEmployee) {
      throw new ForbiddenException();
    } else {
      await this.checkIsActivated(user._id);
      await this.checkIsLocked(user._id);
      if (user.password !== SHA256(reqBody.password as string).toString()) {
        throw new HttpException(
          errorMessages.incorrectCredentials,
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        const payload = {
          userId: user._id.toString(),
        };
        const refreshToken = randomString.generate();
        const accessToken = this.jwtToken.generateAccessToken(payload);
        const accessTokenExpiry = moment()
          .add(
            this.configService.get<number>(
              'momentAddParams.duration',
            ) as moment.DurationInputArg1,
            this.configService.get<string>(
              'momentAddParams.unit',
            ) as moment.DurationInputArg2,
          )
          .toDate();
        await this.refreshTokenService.addRefreshToken(
          refreshToken,
          user._id,
          accessToken,
        );
        return {
          refreshToken: refreshToken,
          accessToken: accessToken,
          accessTokenExpiry: accessTokenExpiry,
          userId: user._id,
        };
      }
    }
  }

  async changePassword(
    reqBody: ChangePassword,
    userId: mongoose.Schema.Types.ObjectId,
  ) {
    const user = await this.userModel.findOne({ _id: userId });
    if (user?.password !== SHA256(reqBody.currentPassword).toString()) {
      throw new HttpException(
        errorMessages.incorrectCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { password: SHA256(reqBody.newPassword).toString() } },
      );
    }
  }

  async ActivateorDeactivateUser(
    userId: mongoose.Types.ObjectId,
    status: boolean,
  ) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { isActivated: status } },
    );
  }
  async getCMSUsers(page: number, limit: number) {
    const users = await this.userModel.aggregate([
      {
        $match: {
          $or: [
            { isAdmin: this.configService.get<boolean>('roleFlags.isAdmin') },
            {
              isEmployee: this.configService.get<boolean>(
                'roleFlags.isEmployee',
              ),
            },
          ],
        },
      },
      {
        $skip:
          (page - this.configService.get<number>('pagination.minValue')) *
          limit,
      },
      { $limit: limit },
      {
        $project: {
          email: 1,
          firstName: 1,
          lastName: 1,
          isVip: 1,
          isAdmin: 1,
          isEmployee: 1,
          isLocked: 1,
          lockedUntil: 1,
          isActivated: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    const totalUsersCount = await this.userModel
      .find({
        $or: [
          { isAdmin: this.configService.get<boolean>('roleFlags.isAdmin') },
          {
            isEmployee: this.configService.get<boolean>('roleFlags.isEmployee'),
          },
        ],
      })
      .countDocuments();
    const lastPage = Math.ceil(totalUsersCount / limit);
    const hasPreviousPage =
      page > this.configService.get<number>('pagination.minValue');
    const hasNextPage = page < lastPage;
    return {
      users: users,
      page: page,
      lastPage: lastPage,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage,
      totalUsersCount: totalUsersCount,
    };
  }
  async getCMSUserDetails(userId: mongoose.Types.ObjectId) {
    const user = await this.userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          email: 1,
          firstName: 1,
          lastName: 1,
          isVip: 1,
          isLocked: 1,
          isAdmin: 1,
          isEmployee: 1,
          lockedUntil: 1,
          isActivated: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    if (!user || user.length == this.configService.get<number>('emptyArray')) {
      throw new HttpException(errorMessages.userNotFound, HttpStatus.NOT_FOUND);
    } else if (!user[0].isAdmin && !user[0].isEmployee) {
      throw new ForbiddenException();
    } else {
      return user[0];
    }
  }

  async makeCMSUserAdmin(userId: mongoose.Types.ObjectId) {
    const user = await this.userModel.findOne({ _id: userId });
    if (user.isEmployee) {
      await this.userModel.updateOne(
        { _id: userId },
        {
          $set: {
            isEmployee: this.configService.get<boolean>(
              'roleFlags.isEmployeeFalse',
            ),
            isAdmin: this.configService.get<boolean>('roleFlags.isAdmin'),
          },
        },
      );
    } else if (user.isAdmin) {
      return;
    } else {
      throw new ForbiddenException();
    }
  }
  async addCMSUser(reqBody: addCMSUserDto, role: string) {
    const user = await this.userModel.findOne({ email: reqBody.email });
    if (user) {
      throw new ConflictException();
    }
    const newPassword = randomString.generate({
      length: this.configService.get<number>('passwordLength'),
    });
    const addedUser = new this.userModel({
      ...reqBody,
      password: SHA256(newPassword).toString(),
    });
    if (role == this.configService.get<string>('roles.admin')) {
      addedUser.isAdmin = this.configService.get<boolean>('roleFlags.isAdmin');
      await addedUser.save();
    }
    if (role == this.configService.get<string>('roles.employee')) {
      addedUser.isEmployee = this.configService.get<boolean>(
        'roleFlags.isEmployee',
      );
      await addedUser.save();
    }
    const mailOptions = {
      from: this.configService.get<string>('mailOptions.from'),
      to: reqBody.email,
      subject: 'New password account',
      html: `
      <p>Hello</p>
      <p>Welcome to the ${role} panel!</p>
      <p>To access your account, please use the following password:</p>
      <p><strong>Password:</strong> ${newPassword}</p>
    `,
    };
    this.emailSender.sendEmail(mailOptions);
  }
  async cmsLogin(reqBody: LoginDto) {
    const user = await this.userModel.findOne({ email: reqBody.email });
    if (!user) {
      throw new HttpException(
        errorMessages.incorrectCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    } else if (!user.isAdmin && !user.isEmployee) {
      throw new ForbiddenException();
    } else {
      await this.checkIsActivated(user._id);
      await this.checkIsLocked(user._id);
      if (user.password !== SHA256(reqBody.password as string).toString()) {
        throw new HttpException(
          errorMessages.incorrectCredentials,
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        const payload = {
          userId: user._id.toString(),
        };
        const refreshToken = randomString.generate();
        const accessToken = this.jwtToken.generateAccessToken(payload);
        const accessTokenExpiry = moment()
          .add(
            this.configService.get(
              'momentAddParams.duration',
            ) as moment.DurationInputArg1,
            this.configService.get(
              'momentAddParams.unit',
            ) as moment.DurationInputArg2,
          )
          .toDate();
        await this.refreshTokenService.addRefreshToken(
          refreshToken,
          user._id,
          accessToken,
        );
        return {
          refreshToken: refreshToken,
          accessToken: accessToken,
          accessTokenExpiry: accessTokenExpiry,
          userId: user._id,
        };
      }
    }
  }
  //this function was used in the otp service
  async findUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      return;
    } else {
      return user;
    }
  }
  //this function was used to lock the user in otp service when the retryCount field exceeds 5
  async lockUser(email: string) {
    await this.userModel.updateOne(
      { email: email },
      {
        $set: {
          isLocked: this.configService.get<boolean>('isLocked.lockedValue'),
          lockedUntil: moment().add(
            this.configService.get<string>(
              'momentAddParams.duration',
            ) as moment.DurationInputArg1,
            this.configService.get<string>(
              'momentAddParams.unit',
            ) as moment.DurationInputArg2,
          ),
        },
      },
    );
  }
  async checkIsLocked(userId: mongoose.Types.ObjectId) {
    const user = await this.userModel.findOne({ _id: userId });
    if (
      user?.isLocked ===
        this.configService.get<boolean>('isLocked.lockedValue') &&
      moment(user?.lockedUntil as moment.MomentInput).isAfter(moment())
    ) {
      throw new HttpException(
        errorMessages.lockedAccount,
        HttpStatus.UNAUTHORIZED,
      );
    } else if (
      user?.isLocked ===
        this.configService.get<boolean>('isLocked.lockedValue') &&
      moment(user?.lockedUntil as moment.MomentInput).isBefore(moment())
    ) {
      await this.userModel.updateOne(
        { _id: userId },
        {
          $set: {
            isLocked: this.configService.get<boolean>('isLocked.unlockedValue'),
          },
        },
      );
    } else if (
      user?.isLocked ===
      this.configService.get<boolean>('isLocked.unlockedValue')
    ) {
      return;
    }
  }
  async checkIsActivated(userId: mongoose.Types.ObjectId) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user.isActivated) {
      throw new HttpException(
        errorMessages.deactivatedAccount,
        HttpStatus.FORBIDDEN,
      );
    } else {
      return;
    }
  }
  //this function was used in the otp service to reset the password
  async resetPassword(userId: mongoose.Types.ObjectId, password: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: SHA256(password).toString() } },
    );
  }
  //this function is used in the isAdmin guard and isEmployee guard
  async getUserById(userId: mongoose.Types.ObjectId) {
    const user = await this.userModel.findOne({ _id: userId });
    return user;
  }
}
