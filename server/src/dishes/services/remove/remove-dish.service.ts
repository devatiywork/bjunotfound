import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveDishService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, userId: string, isAdmin: boolean) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверка прав доступа
    if (!isAdmin && dish.userId !== userId) {
      throw new ForbiddenException('Недостаточно прав для удаления');
    }

    await this.prisma.dish.delete({
      where: { id },
    });

    return { message: 'Блюдо успешно удалено' };
  }
}
