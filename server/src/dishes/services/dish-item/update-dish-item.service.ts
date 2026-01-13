import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeasureType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateDishItemDto } from '../../dto/update-dish-item.dto';

/**
 * Сервис для обновления ингредиента блюда
 */
@Injectable()
export class UpdateDishItemService {
  constructor(private prisma: PrismaService) {}

  /**
   * Обновляет ингредиент блюда с валидацией
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @param itemId - ID ингредиента
   * @param dto - Обновляемые данные
   * @returns Обновленный ингредиент
   */
  async execute(
    userId: string,
    dishId: string,
    itemId: string,
    dto: UpdateDishItemDto,
  ) {
    // Проверка 1: Ингредиент существует и принадлежит указанному блюду
    const item = await this.prisma.dishItem.findUnique({
      where: { id: itemId },
      include: { dish: true },
    });

    if (!item) {
      throw new NotFoundException('Ингредиент не найден');
    }

    if (item.dishId !== dishId) {
      throw new BadRequestException('Ингредиент не принадлежит этому блюду');
    }

    if (item.dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Проверка 2: Если меняется продукт - проверяем владельца
    if (dto.productUserId) {
      const product = await this.prisma.productUser.findUnique({
        where: { id: dto.productUserId },
      });

      if (!product) {
        throw new NotFoundException('Продукт не найден');
      }

      if (product.userId !== userId) {
        throw new ForbiddenException('Нет доступа к этому продукту');
      }
    }

    // Определяем финальный measureType (новый или текущий)
    const finalMeasureType = dto.measureType ?? item.measureType;
    const finalProductUserId = dto.productUserId ?? item.productUserId;

    // Проверка 3: Валидация полей для measureType
    if (dto.measureType) {
      this.validateMeasureTypeFields(dto, finalMeasureType);
    }

    // Проверка 4: Если SERVINGS - проверяем принадлежность порции продукту
    if (finalMeasureType === MeasureType.SERVINGS && dto.servingId) {
      await this.validateServing(finalProductUserId, dto.servingId);
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      note: dto.note,
      sortOrder: dto.sortOrder,
    };

    if (dto.productUserId) {
      updateData.productUserId = dto.productUserId;
    }

    if (dto.measureType) {
      updateData.measureType = dto.measureType;

      // Сбрасываем все поля количества
      updateData.amountG = null;
      updateData.amountMl = null;
      updateData.servingId = null;
      updateData.servingsCount = null;

      // Устанавливаем нужные поля
      switch (dto.measureType) {
        case MeasureType.GRAMS:
          updateData.amountG = dto.amountG;
          break;
        case MeasureType.MILLILITERS:
          updateData.amountMl = dto.amountMl;
          break;
        case MeasureType.SERVINGS:
          updateData.servingId = dto.servingId;
          updateData.servingsCount = dto.servingsCount;
          break;
      }
    } else {
      // Если measureType не меняется - обновляем только соответствующие поля
      if (finalMeasureType === MeasureType.GRAMS && dto.amountG !== undefined) {
        updateData.amountG = dto.amountG;
      }
      if (
        finalMeasureType === MeasureType.MILLILITERS &&
        dto.amountMl !== undefined
      ) {
        updateData.amountMl = dto.amountMl;
      }
      if (finalMeasureType === MeasureType.SERVINGS) {
        if (dto.servingId !== undefined) updateData.servingId = dto.servingId;
        if (dto.servingsCount !== undefined)
          updateData.servingsCount = dto.servingsCount;
      }
    }

    // Обновляем ингредиент
    return this.prisma.dishItem.update({
      where: { id: itemId },
      data: updateData,
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
  private validateMeasureTypeFields(
    dto: UpdateDishItemDto,
    measureType: MeasureType,
  ) {
    switch (measureType) {
      case MeasureType.GRAMS:
        if (!dto.amountG || dto.amountG <= 0) {
          throw new BadRequestException(
            'Для типа GRAMS необходимо указать amountG > 0',
          );
        }
        break;

      case MeasureType.MILLILITERS:
        if (!dto.amountMl || dto.amountMl <= 0) {
          throw new BadRequestException(
            'Для типа MILLILITERS необходимо указать amountMl > 0',
          );
        }
        break;

      case MeasureType.SERVINGS:
        if (!dto.servingId || !dto.servingsCount || dto.servingsCount <= 0) {
          throw new BadRequestException(
            'Для типа SERVINGS необходимо указать servingId и servingsCount > 0',
          );
        }
        break;
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
