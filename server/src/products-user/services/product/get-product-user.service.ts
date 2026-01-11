import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetProductUserService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, userId: string, isAdmin: boolean) {
    // 1. Получение продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id },
      include: {
        names: true,
        nutrition: true,
        category: true,
        brand: true,
        productGlobal: {
          include: {
            names: true,
            nutrition: true,
          },
        },
        packages: {
          orderBy: { purchasedAt: 'desc' },
        },
        servings: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Нет прав для просмотра этого продукта');
    }

    return product;
  }
}
