import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DishStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetDishService } from './get-dish.service';

/**
 * Сервис для изменения статуса блюда
 */
@Injectable()
export class UpdateDishStatusService {
  constructor(
    private prisma: PrismaService,
    private getDishService: GetDishService,
  ) {}

  /**
   * Изменяет статус блюда с валидацией
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @param newStatus - Новый статус
   * @returns Обновленное блюдо
   */
  async execute(userId: string, dishId: string, newStatus: DishStatus) {
    // Проверяем существование и владельца
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    if (dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Если меняем на READY - проверяем наличие критичных issues
    if (newStatus === DishStatus.READY) {
      await this.validateReadyStatus(userId, dishId);
    }

    // DRAFT → READY и обратно всегда разрешены
    return this.prisma.dish.update({
      where: { id: dishId },
      data: { status: newStatus },
    });
  }

  /**
   * Проверяет, что блюдо может быть переведено в статус READY
   * Блюдо должно иметь хотя бы один ингредиент и не иметь критичных ошибок
   */
  private async validateReadyStatus(userId: string, dishId: string) {
    // Получаем блюдо с расчетами
    const dishResponse = await this.getDishService.execute(userId, dishId);

    // Проверка 1: Есть ли ингредиенты?
    if (!dishResponse.items || dishResponse.items.length === 0) {
      throw new BadRequestException(
        'Невозможно перевести блюдо в статус READY: нет ингредиентов',
      );
    }

    // Проверка 2: Есть ли критичные ошибки?
    const errors = dishResponse.issues.filter((i) => i.severity === 'error');
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => e.message).join('; ');
      throw new BadRequestException(
        `Невозможно перевести блюдо в статус READY. Ошибки: ${errorMessages}`,
      );
    }

    // Предупреждения не блокируют переход в READY
  }
}
