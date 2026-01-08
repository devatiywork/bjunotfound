import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteWeightService {
  constructor(private prisma: PrismaService) {}

  /**
   * Удаление записи веса
   */
  async execute(weightId: string, userId: string) {
    const weight = await this.prisma.weight.findUnique({
      where: { id: weightId },
    });

    if (!weight) {
      throw new NotFoundException('Запись веса не найдена');
    }

    // Проверка прав: пользователь может удалять только свои записи
    if (weight.userId !== userId) {
      throw new NotFoundException('У вас нет прав для удаления этой записи');
    }

    // Удаляем запись
    await this.prisma.weight.delete({
      where: { id: weightId },
    });

    return { message: 'Запись веса успешно удалена' };
  }
}
