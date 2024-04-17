import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ComplaintDto, QueryDto, UpdateStatusDto } from './dto/complaint.dto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Complaint } from './complaint.model';
import { CategoryService } from 'src/category/category.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ConfigService } from '@nestjs/config';
import errorMessages from 'errorMessages';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectModel(Complaint.name)
    private readonly complaintModel: Model<Complaint>,
    private readonly categoryService: CategoryService,
    private readonly socketGateway: SocketGateway,
    private readonly configService: ConfigService,
  ) {}
  async createComplaint(
    reqBody: ComplaintDto,
    userId: mongoose.Types.ObjectId,
  ) {
    //for every categoryId a check was done to make sure it is a valid categoryId
    for (const categoryId of reqBody.categoryIds) {
      await this.categoryService.getCategoryDetails(categoryId);
    }
    const totalComplaints = await this.complaintModel.find().countDocuments();
    await new this.complaintModel({
      title: `${reqBody.title}#${totalComplaints + this.configService.get<number>('complaintNumberIncrement')}`,
      body: reqBody.body,
      categoryIds: reqBody.categoryIds,
      createdBy: userId,
    }).save();
  }
  async getMyComplaints(
    userId: mongoose.Types.ObjectId,
    page: number,
    limit: number,
  ) {
    const complaints = await this.complaintModel.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $skip:
          (page - this.configService.get<number>('pagination.minValue')) *
          limit,
      },
      { $limit: limit },
    ]);
    const totalComplaintsCount = await this.complaintModel
      .find({ createdBy: userId })
      .countDocuments();
    const lastPage = Math.ceil(totalComplaintsCount / limit);
    const hasPreviousPage =
      page > this.configService.get<number>('pagination.minValue');
    const hasNextPage = page < lastPage;
    return {
      complaints: complaints,
      page: page,
      lastPage: lastPage,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage,
      totalComplaintCount: totalComplaintsCount,
    };
  }
  async getComplaintDetails(
    complaintId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ) {
    const complaint = await this.complaintModel.findOne({ _id: complaintId });
    if (!complaint) {
      throw new HttpException(
        errorMessages.complaintNotFound,
        HttpStatus.NOT_FOUND,
      );
    } else if (complaint!.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenException();
    } else {
      return complaint;
    }
  }
  async deleteComplaint(
    complaintId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ) {
    await this.getComplaintDetails(complaintId, userId);
    await this.complaintModel.deleteOne({ _id: complaintId });
  }
  async updateStatus(
    complaintId: mongoose.Types.ObjectId,
    reqBody: UpdateStatusDto,
    userId: mongoose.Types.ObjectId,
  ) {
    const complaint = await this.complaintModel.findOne({ _id: complaintId });
    if (!complaint) {
      throw new HttpException(
        errorMessages.complaintNotFound,
        HttpStatus.NOT_FOUND,
      );
    } else {
      await this.complaintModel.updateOne(
        { _id: complaintId },
        { $set: { status: reqBody.status } },
      );
      await this.socketGateway.emitNotification(
        complaint.createdBy.toString(),
        {
          text: `your complaint status has been changed to ${reqBody.status}`,
          senderId: userId,
          receiverId: complaint.createdBy,
          complaintId: complaint._id,
        },
      );
    }
  }

  async getClientsComplaints(
    userId: mongoose.Types.ObjectId,
    status: string,
    page: number,
    limit: number,
  ) {
    const query: QueryDto = {};
    if (userId) {
      query.createdBy = new mongoose.Types.ObjectId(userId);
    }
    if (status) {
      query.status = status;
    }
    const complaints = await this.complaintModel.aggregate([
      { $match: { ...query } },
      {
        $skip:
          (page - this.configService.get<number>('pagination.minValue')) *
          limit,
      },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ]);
    const totalComplaintsCount = await this.complaintModel
      .find(query)
      .countDocuments();
    const lastPage = Math.ceil(totalComplaintsCount / limit);
    const hasPreviousPage =
      page > this.configService.get<number>('pagination.minValue');
    const hasNextPage = page < lastPage;
    return {
      complaints: complaints,
      page: page,
      lastPage: lastPage,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage,
      totalComplaintCount: totalComplaintsCount,
    };
  }

  async getComplaintsGroupedByStatus(userId: mongoose.Types.ObjectId) {
    return await this.complaintModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: { status: '$status' },
          complaints: {
            $push: {
              title: '$title',
              body: '$body',
              categoryIds: '$categoryIds',
              createdBy: '$createdBy',
            },
          },
        },
      },
    ]);
  }
}
