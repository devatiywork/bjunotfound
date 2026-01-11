import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteServingService {
  constructor(private prisma: PrismaService) {}

  async execute(productId: string, servingId: string, userId: string) {
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
        'Нет прав для удаления порции этого продукта',
      );
    }

    // 3. Проверка существования порции
    const serving = await this.prisma.productUserServing.findUnique({
      where: { id: servingId },
    });

    if (!serving) {
      throw new NotFoundException(`Порция с ID "${servingId}" не найдена`);
    }

    if (serving.productUserId !== productId) {
      throw new NotFoundException('Порция не принадлежит этому продукту');
    }

    // 4. Удаление порции
    await this.prisma.productUserServing.delete({
      where: { id: servingId },
    });

    return { message: 'Порция успешно удалена' };
  }
}
