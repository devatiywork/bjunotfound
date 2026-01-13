import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDishDto } from '../../dto/create-dish.dto';

/**
 * Сервис для создания блюда
 */
@Injectable()
export class CreateDishService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создает новое блюдо со статусом DRAFT
   *
   * @param userId - ID пользователя-владельца
   * @param dto - Данные блюда
   * @returns Созданное блюдо
   */
  async execute(userId: string, dto: CreateDishDto) {
    return this.prisma.dish.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        portions: dto.portions,
        status: 'DRAFT', // По умолчанию всегда DRAFT
      },
    });
  }
}
