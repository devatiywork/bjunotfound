import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListMyBrandsService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
    // Все бренды пользователя (одобренные, на модерации, отклоненные)
    const brands = await this.prisma.brand.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return brands;
  }
}
