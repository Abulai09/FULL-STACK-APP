import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuards';
import { Request } from 'express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() query: QueryProductDto) {
    return await this.productService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMy(@Req() req: Request) {
    const user = req.user as any;
    return await this.productService.findMyProducts(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.productService.findOne(id);
  }

  // ✅ Создать с фото
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image')) // 'image' — имя поля в form-data
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: Request,
    @UploadedFile() file?: any,
  ) {
    const user = req.user as any;
    return await this.productService.create(dto, user.id, file);
  }

  // ✅ Обновить с фото
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
    @UploadedFile() file?: any,
  ) {
    const user = req.user as any;
    return await this.productService.update(id, dto, user, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as any;
    return await this.productService.remove(id, user);
  }
}
