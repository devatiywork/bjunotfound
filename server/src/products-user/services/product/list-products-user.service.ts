import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListProductsUserService {
  constructor(private prisma: PrismaService) {}

  async execute(
    page: number = 1,
    limit: number = 20,
    filters?: {
      categoryId?: string;
      brandId?: string;
      userId?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where = {
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.brandId && { brandId: filters.brandId }),
      ...(filters?.userId && { userId: filters.userId }),
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
          user: {
            select: {
              id: true,
              email: true,
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
