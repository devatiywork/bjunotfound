import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetBrandService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, isAdmin: boolean, userId?: string) {
    // 1. Получение бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
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
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Проверка доступа
    // Администратор видит всё
    // Создатель видит свой бренд (даже если не одобрен)
    // Остальные видят только одобренные
    const isCreator = userId && brand.createdBy === userId;

    if (!brand.isApproved && !isAdmin && !isCreator) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    return brand;
  }
}
