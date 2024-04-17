import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintDto, UpdateStatusDto, filterDTO } from './dto/complaint.dto';
import { paginationQuery } from 'src/utils/pagination.dto';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/guards/auth.guard';
import { IsAdmin } from 'src/decorator/isAdmin.decorator';
import { IsAdminGuard } from 'src/guards/isAdmin.guard';
import { IsEmployee } from 'src/decorator/isEmployee.decorator';
import { IsEmployeeGuard } from 'src/guards/isEmployee.guard';

@UseGuards(AuthGuard)
@Controller('complaint')
export class ComplaintController {
  constructor(
    private readonly complaintService: ComplaintService,
    private configService: ConfigService,
  ) {}

  @Post()
  async createComplaint(@Body() reqBody: ComplaintDto, @Req() { userId }) {
    return await this.complaintService.createComplaint(reqBody, userId);
  }

  @Get()
  async getMyComplaints(@Req() { userId }, @Query() query: paginationQuery) {
    return await this.complaintService.getMyComplaints(
      userId,
      query.page ||
        this.configService.get<number>('pagination.defaultValues.page'),
      query.limit ||
        this.configService.get<number>('pagination.defaultValues.limit'),
    );
  }

  @Get('/details/:complaintId')
  async getComplaintDetails(
    @Param('complaintId') complaintId: mongoose.Types.ObjectId,
    @Req() { userId },
  ) {
    return await this.complaintService.getComplaintDetails(complaintId, userId);
  }

  @Delete('/:complaintId')
  async deleteComplaint(
    @Param('complaintId') complaintId: mongoose.Types.ObjectId,
    @Req() { userId },
  ) {
    return await this.complaintService.deleteComplaint(complaintId, userId);
  }

  @IsAdmin(true)
  @UseGuards(IsAdminGuard)
  @Put('admin/:complaintId')
  async updateStatus(
    @Param('complaintId') complaintId: mongoose.Types.ObjectId,
    @Body() reqBody: UpdateStatusDto,
    @Req() { userId },
  ) {
    return await this.complaintService.updateStatus(
      complaintId,
      reqBody,
      userId,
    );
  }

  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Get('admin/client')
  async getClientsComplaints(@Query() query: filterDTO) {
    return await this.complaintService.getClientsComplaints(
      query.userId,
      query.status,
      query.page ||
        this.configService.get<number>('pagination.defaultValues.page'),
      query.limit ||
        this.configService.get<number>('pagination.defaultValues.limit'),
    );
  }

  @Get('by-status')
  async getComplaintsGroupedByStatus(@Req() { userId }) {
    return await this.complaintService.getComplaintsGroupedByStatus(userId);
  }
}
