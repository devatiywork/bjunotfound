import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListPendingBrandsService {
  constructor(private prisma: PrismaService) {}

  async execute() {
    // Бренды на модерации: не одобрены И не отклонены
    const brands = await this.prisma.brand.findMany({
      where: {
        isApproved: false,
        rejectedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Старые в начале списка
      },
    });

    return brands;
  }
}
