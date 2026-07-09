import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { RedisService } from 'src/redis/redis.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User, UserRole } from 'src/user/entities/user.entity';

const PRODUCTS_CACHE_TTL = 60 * 5;
const PRODUCTS_CACHE_KEY = 'products:list';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private redisService: RedisService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: QueryProductDto) {
    const cacheKey = `${PRODUCTS_CACHE_KEY}:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const { search, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (search) where.title = Like(`%${search}%`);

    const [products, total] = await this.productRepo.findAndCount({
      where,
      skip,
      take: limit,
    });

    const result = {
      data: products,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
    await this.redisService.set(cacheKey, result, PRODUCTS_CACHE_TTL);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `product:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.redisService.set(cacheKey, product, PRODUCTS_CACHE_TTL);
    return product;
  }

  // ✅ file опциональный
  async create(dto: CreateProductDto, userId: number, file?: any) {
    let imageUrl: string | undefined;

    if (file) {
      imageUrl = await this.cloudinaryService.uploadFile(file, 'products');
    }

    const product = this.productRepo.create({ ...dto, userId, imageUrl });
    const saved = await this.productRepo.save(product);
    await this.invalidateListCache();
    return saved;
  }

  async update(id: number, dto: UpdateProductDto, user: User, file?: any) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (product.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own products');
    }

    // ✅ Если новое фото — удаляем старое с Cloudinary
    if (file) {
      if (product.imageUrl) {
        await this.cloudinaryService.deleteFile(product.imageUrl);
      }
      product.imageUrl = await this.cloudinaryService.uploadFile(
        file,
        'products',
      );
    }

    Object.assign(product, dto);
    const updated = await this.productRepo.save(product);

    await this.redisService.del(`product:${id}`);
    await this.invalidateListCache();
    return updated;
  }

  async remove(id: number, user: User) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (product.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own products');
    }

    // ✅ Удаляем фото с Cloudinary при удалении продукта
    if (product.imageUrl) {
      await this.cloudinaryService.deleteFile(product.imageUrl);
    }

    await this.productRepo.remove(product);
    await this.redisService.del(`product:${id}`);
    await this.invalidateListCache();
    return { message: 'Product deleted' };
  }

  async findMyProducts(userId: number) {
    return await this.productRepo.find({
      where: { userId },
    });
  }

  private async invalidateListCache() {
    const keys = await this.redisService.keys(`${PRODUCTS_CACHE_KEY}:*`);
    await Promise.all(keys.map((key) => this.redisService.del(key)));
  }
}
