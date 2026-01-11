import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeletePackageService {
  constructor(private prisma: PrismaService) {}

  async execute(productId: string, packageId: string, userId: string) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${productId}" не найден`);
    }

    // 2. Проверка владельца
    if (product.userId !== userId) {
      throw new ForbiddenException(
        'Нет прав для удаления упаковки этого продукта',
      );
    }

    // 3. Проверка существования упаковки
    const packageItem = await this.prisma.productUserPackage.findUnique({
      where: { id: packageId },
    });

    if (!packageItem) {
      throw new NotFoundException(`Упаковка с ID "${packageId}" не найдена`);
    }

    if (packageItem.productUserId !== productId) {
      throw new NotFoundException('Упаковка не принадлежит этому продукту');
    }

    // 4. Удаление упаковки
    await this.prisma.productUserPackage.delete({
      where: { id: packageId },
    });

    return { message: 'Упаковка успешно удалена' };
  }
}
