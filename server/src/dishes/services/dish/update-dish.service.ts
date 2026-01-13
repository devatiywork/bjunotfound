import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateDishDto } from '../../dto/update-dish.dto';

/**
 * Сервис для обновления блюда
 */
@Injectable()
export class UpdateDishService {
  constructor(private prisma: PrismaService) {}

  /**
   * Обновляет данные блюда
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @param dto - Обновляемые данные
   * @returns Обновленное блюдо
   */
  async execute(userId: string, dishId: string, dto: UpdateDishDto) {
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

    // Обновляем блюдо
    return this.prisma.dish.update({
      where: { id: dishId },
      data: {
        name: dto.name,
        description: dto.description,
        portions: dto.portions,
      },
    });
  }
}
