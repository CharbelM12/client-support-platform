import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.model';
import { CategoryDto } from './dto/category.dto';
import { ConfigService } from '@nestjs/config';
import errorMessages from 'errorMessages';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly configService: ConfigService,
  ) {}

  async createCategory(reqBody: CategoryDto, userId: mongoose.Types.ObjectId) {
    const foundCategoryName = await this.categoryModel.findOne({
      name: reqBody.name,
    });
    if (foundCategoryName) {
      throw new ConflictException();
    } else {
      await new this.categoryModel({
        name: reqBody.name,
        description: reqBody.description,
        createdBy: userId,
      }).save();
    }
  }
  async getCategories(page: number, limit: number) {
    const categories = await this.categoryModel.aggregate([
      {
        $skip:
          (page - this.configService.get<number>('pagination.minValue')) *
          limit,
      },
      { $limit: limit },
    ]);
    const totalCategoriesCount = await this.categoryModel
      .find()
      .countDocuments();
    const lastPage = Math.ceil(totalCategoriesCount / limit);
    const hasPreviousPage =
      page > this.configService.get<number>('pagination.minValue');
    const hasNextPage = page < lastPage;
    return {
      categories: categories,
      page: page,
      lastPage: lastPage,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage,
      totalCategoriesCount: totalCategoriesCount,
    };
  }
  async getCategoryDetails(categoryId: mongoose.Types.ObjectId) {
    const category = await this.categoryModel.findOne({ _id: categoryId });
    if (!category) {
      throw new HttpException(
        errorMessages.categoryNotFound,
        HttpStatus.NOT_FOUND,
      );
    } else {
      return category;
    }
  }
  async updateCategory(
    categoryId: mongoose.Types.ObjectId,
    reqBody: CategoryDto,
    userId: mongoose.Schema.Types.ObjectId,
  ) {
    await this.getCategoryDetails(categoryId);
    await this.categoryModel.updateOne(
      { _id: categoryId },
      { $set: reqBody, updatedBy: userId },
    );
  }
  async deleteCategory(categoryId: mongoose.Types.ObjectId) {
    await this.getCategoryDetails(categoryId);
    await this.categoryModel.deleteOne({ _id: categoryId });
  }

  async getCategoriesByAdmin(userId: mongoose.Types.ObjectId) {
    return await this.categoryModel.find({ createdBy: userId });
  }
}
