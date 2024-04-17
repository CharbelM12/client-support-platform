import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Email {
  private transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('mailOptions.service'),
      auth: {
        user: this.configService.get('mailOptions.user'),
        pass: this.configService.get('mailOptions.pass'),
      },
    });
  }

  async sendEmail(mailOptions: object) {
    await this.transporter.sendMail(mailOptions);
  }
}
