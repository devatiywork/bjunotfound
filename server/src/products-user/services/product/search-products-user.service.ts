import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SearchProductsUserService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, query: string) {
    // Поиск по названиям продукта
    const products = await this.prisma.productUser.findMany({
      where: {
        userId,
        names: {
          some: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      },
      take: 50,
      include: {
        names: true,
        nutrition: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  }
}
