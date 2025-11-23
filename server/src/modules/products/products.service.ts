import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  create(dto: CreateProductDto) {
    const data: Prisma.ProductCreateInput = {
      name: dto.name,
      sku: dto.sku,
      price: new Prisma.Decimal(dto.price),
      unit: dto.unit,
      isActive: dto.isActive ?? true,
    };
    return this.prisma.product.create({ data });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const data: Prisma.ProductUpdateInput = {
      ...dto,
    };
    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price);
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
