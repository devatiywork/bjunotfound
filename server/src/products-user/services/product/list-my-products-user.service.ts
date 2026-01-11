import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListMyProductsUserService {
  constructor(private prisma: PrismaService) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      categoryId?: string;
      brandId?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.brandId && { brandId: filters.brandId }),
    };

    const [products, total] = await Promise.all([
      this.prisma.productUser.findMany({
        where,
        skip,
        take: limit,
        include: {
          names: true,
          nutrition: true,
          category: true,
          brand: true,
          productGlobal: {
            select: {
              id: true,
              barcode: true,
            },
          },
          _count: {
            select: {
              packages: true,
              servings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productUser.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
