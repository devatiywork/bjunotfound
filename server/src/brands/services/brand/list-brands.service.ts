import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListBrandsService {
  constructor(private prisma: PrismaService) {}

  async execute(isAdmin: boolean) {
    // Для обычных пользователей - только одобренные
    // Для администраторов - все бренды
    const where = isAdmin ? {} : { isApproved: true };

    const brands = await this.prisma.brand.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
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
      orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
    });

    return brands;
  }
}
