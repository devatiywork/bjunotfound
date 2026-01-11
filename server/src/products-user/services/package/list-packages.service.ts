import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListPackagesService {
  constructor(private prisma: PrismaService) {}

  async execute(productId: string, userId: string, isAdmin: boolean) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${productId}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Нет прав для просмотра упаковок этого продукта',
      );
    }

    // 3. Получение списка упаковок
    const packages = await this.prisma.productUserPackage.findMany({
      where: { productUserId: productId },
      orderBy: { purchasedAt: 'desc' },
    });

    return packages;
  }
}
