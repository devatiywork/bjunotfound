import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteProductUserService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, userId: string, isAdmin: boolean) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Нет прав для удаления этого продукта');
    }

    // 3. TODO: Проверка использования в MealPlan (когда будет реализован)
    // const mealPlanCount = await this.prisma.mealPlan.count({
    //   where: { productUserId: id },
    // });
    // if (mealPlanCount > 0) {
    //   throw new BadRequestException(
    //     `Невозможно удалить продукт: используется в ${mealPlanCount} планах питания`,
    //   );
    // }

    // 4. Каскадное удаление (i18n, nutrition, packages, servings удаляются автоматически)
    await this.prisma.productUser.delete({
      where: { id },
    });

    return { message: 'Продукт успешно удален' };
  }
}
