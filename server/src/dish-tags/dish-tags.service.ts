import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishTagDto } from './dto/create-dish-tag.dto';
import { UpdateDishTagDto } from './dto/update-dish-tag.dto';

@Injectable()
export class DishTagsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создание тега блюда (только админ)
   */
  async create(dto: CreateDishTagDto) {
    // Проверка уникальности имени
    const existing = await this.prisma.dishTag.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Тег с таким именем уже существует');
    }

    return this.prisma.dishTag.create({
      data: dto,
    });
  }

  /**
   * Получение всех тегов блюд (публичный)
   */
  async findAll() {
    const tags = await this.prisma.dishTag.findMany({
      include: {
        _count: {
          select: { dishes: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return tags;
  }

  /**
   * Получение тега по ID (публичный)
   */
  async findOne(id: string) {
    const tag = await this.prisma.dishTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    return tag;
  }

  /**
   * Обновление тега (только админ)
   */
  async update(id: string, dto: UpdateDishTagDto) {
    const tag = await this.prisma.dishTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    // Проверка уникальности имени (если меняется)
    if (dto.name && dto.name !== tag.name) {
      const existing = await this.prisma.dishTag.findUnique({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Тег с таким именем уже существует');
      }
    }

    return this.prisma.dishTag.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Удаление тега (только админ)
   */
  async remove(id: string) {
    const tag = await this.prisma.dishTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    // Защита от удаления тега, используемого в блюдах
    if (tag._count.dishes > 0) {
      throw new BadRequestException(
        `Невозможно удалить тег, используемый в ${tag._count.dishes} блюдах`,
      );
    }

    await this.prisma.dishTag.delete({
      where: { id },
    });

    return { message: 'Тег успешно удален' };
  }
}
