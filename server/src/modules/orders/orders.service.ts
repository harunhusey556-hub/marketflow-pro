import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products do not exist');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = new Prisma.Decimal(0);

    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = new Prisma.Decimal(product.price);
      const lineTotal = unitPrice.mul(item.quantity);
      total = total.add(lineTotal);

      return {
        productId: product.id,
        orderedQty: item.quantity,
        deliveredQty: null,
        unitPrice,
        discount: new Prisma.Decimal(0),
        lineTotal,
      };
    });

    return this.prisma.order.create({
      data: {
        customerId,
        status: OrderStatus.PENDING,
        deliveryAddress: dto.deliveryAddress,
        deliveryTimeWindow: dto.deliveryTimeWindow,
        totalAmount: total,
        items: { create: orderItems },
      },
      include: { items: true },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.findAll();
    }
    return this.prisma.order.findMany({
      where: { customerId: userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (role !== 'ADMIN' && order.customerId !== userId) {
      throw new ForbiddenException('Not allowed to access this order');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
