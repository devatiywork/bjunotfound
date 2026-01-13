import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeasureType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddDishItemDto } from '../../dto/add-dish-item.dto';

/**
 * Сервис для добавления ингредиента в блюдо
 */
@Injectable()
export class AddDishItemService {
  constructor(private prisma: PrismaService) {}

  /**
   * Добавляет ингредиент в блюдо с валидацией
   *
   * @param userId - ID пользователя (для проверки владельца блюда)
   * @param dishId - ID блюда
   * @param dto - Данные ингредиента
   * @returns Созданный ингредиент
   */
  async execute(userId: string, dishId: string, dto: AddDishItemDto) {
    // Проверка 1: Блюдо существует и принадлежит пользователю
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    if (dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Проверка 2: Продукт существует и принадлежит пользователю
    const product = await this.prisma.productUser.findUnique({
      where: { id: dto.productUserId },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому продукту');
    }

    // Проверка 3: Валидация полей в зависимости от measureType
    this.validateMeasureTypeFields(dto);

    // Проверка 4: Если SERVINGS - проверяем, что порция принадлежит продукту
    if (dto.measureType === MeasureType.SERVINGS && dto.servingId) {
      await this.validateServing(dto.productUserId, dto.servingId);
    }

    // Определяем sortOrder (если не указан - макс + 1)
    let sortOrder = dto.sortOrder ?? 0;
    if (dto.sortOrder === undefined) {
      const maxOrder = await this.prisma.dishItem.findFirst({
        where: { dishId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = maxOrder ? maxOrder.sortOrder + 1 : 0;
    }

    // Создаем ингредиент
    return this.prisma.dishItem.create({
      data: {
        dishId,
        productUserId: dto.productUserId,
        measureType: dto.measureType,
        amountG: dto.measureType === MeasureType.GRAMS ? dto.amountG : null,
        amountMl:
          dto.measureType === MeasureType.MILLILITERS ? dto.amountMl : null,
        servingId:
          dto.measureType === MeasureType.SERVINGS ? dto.servingId : null,
        servingsCount:
          dto.measureType === MeasureType.SERVINGS ? dto.servingsCount : null,
        sortOrder,
        note: dto.note,
      },
      include: {
        productUser: {
          include: {
            names: true,
          },
        },
        serving: true,
      },
    });
  }

  /**
   * Валидирует, что заполнены правильные поля для выбранного типа измерения
   */
  private validateMeasureTypeFields(dto: AddDishItemDto) {
    switch (dto.measureType) {
      case MeasureType.GRAMS:
        if (!dto.amountG || dto.amountG <= 0) {
          throw new BadRequestException(
            'Для типа GRAMS необходимо указать amountG > 0',
          );
        }
        if (dto.amountMl || dto.servingId || dto.servingsCount) {
          throw new BadRequestException(
            'Для типа GRAMS можно указать только amountG',
          );
        }
        break;

      case MeasureType.MILLILITERS:
        if (!dto.amountMl || dto.amountMl <= 0) {
          throw new BadRequestException(
            'Для типа MILLILITERS необходимо указать amountMl > 0',
          );
        }
        if (dto.amountG || dto.servingId || dto.servingsCount) {
          throw new BadRequestException(
            'Для типа MILLILITERS можно указать только amountMl',
          );
        }
        break;

      case MeasureType.SERVINGS:
        if (!dto.servingId || !dto.servingsCount || dto.servingsCount <= 0) {
          throw new BadRequestException(
            'Для типа SERVINGS необходимо указать servingId и servingsCount > 0',
          );
        }
        if (dto.amountG || dto.amountMl) {
          throw new BadRequestException(
            'Для типа SERVINGS можно указать только servingId и servingsCount',
          );
        }
        break;

      default:
        throw new BadRequestException(
          `Неизвестный тип измерения: ${dto.measureType}`,
        );
    }
  }

  /**
   * Проверяет, что порция принадлежит указанному продукту
   */
  private async validateServing(productUserId: string, servingId: string) {
    const serving = await this.prisma.productUserServing.findUnique({
      where: { id: servingId },
    });

    if (!serving) {
      throw new NotFoundException('Порция не найдена');
    }

    if (serving.productUserId !== productUserId) {
      throw new BadRequestException(
        'Порция не принадлежит указанному продукту',
      );
    }
  }
}
