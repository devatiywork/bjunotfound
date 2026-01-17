import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMealTypeDto } from '../../dto';

@Injectable()
export class CreateMealTypeService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, dto: CreateMealTypeDto) {
    return this.prisma.mealType.create({
      data: {
        userId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
        code: null, // Пользовательские типы не имеют кода
      },
    });
  }
}
