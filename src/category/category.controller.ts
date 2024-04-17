import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
  UseGuards,
  UsePipes,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import mongoose from 'mongoose';
import { paginationQuery } from 'src/utils/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/guards/auth.guard';
import { IsEmployee } from 'src/decorator/isEmployee.decorator';
import { IsEmployeeGuard } from 'src/guards/isEmployee.guard';
import { Public } from 'src/decorator/public.decorator';

@UseGuards(AuthGuard)
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly configService: ConfigService,
  ) {}

  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Post()
  async createCategory(@Body() reqBody: CategoryDto, @Req() { userId }) {
    return await this.categoryService.createCategory(reqBody, userId);
  }
  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Get()
  async getCategories(@Query() query: paginationQuery) {
    return await this.categoryService.getCategories(
      query.page ||
        this.configService.get<number>('pagination.defaultValues.page'),
      query.limit ||
        this.configService.get<number>('pagination.defaultValues.limit'),
    );
  }
  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Get('/details/:categoryId')
  async getCategoryDetails(
    @Param('categoryId') categoryId: mongoose.Types.ObjectId,
  ) {
    return await this.categoryService.getCategoryDetails(categoryId);
  }
  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Put(':categoryId')
  async updateCategory(
    @Param('categoryId') categoryId: mongoose.Types.ObjectId,
    @Body() reqBody: CategoryDto,
    @Req() { userId },
  ) {
    return await this.categoryService.updateCategory(
      categoryId,
      reqBody,
      userId,
    );
  }
  @IsEmployee(true)
  @UseGuards(IsEmployeeGuard)
  @Delete(':categoryId')
  async deleteCategory(
    @Param('categoryId') categoryId: mongoose.Types.ObjectId,
  ) {
    return await this.categoryService.deleteCategory(categoryId);
  }

  @Public()
  @Get('by-admin')
  async getCategoriesByAdmin(@Query('userId') userId: mongoose.Types.ObjectId) {
    return await this.categoryService.getCategoriesByAdmin(userId);
  }
}
