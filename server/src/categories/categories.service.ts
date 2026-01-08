import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateCategoryDto {
  name: string;
  description?: string;
}

interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    // Проверка уникальности имени
    const existing = await this.prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException('Категория с таким именем уже существует');
    }

    return this.prisma.category.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    // Проверка уникальности имени (если обновляется)
    if (data.name && data.name !== category.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: data.name },
      });

      if (existing) {
        throw new BadRequestException(
          'Категория с таким именем уже существует',
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Невозможно удалить категорию: к ней привязано ${category._count.products} продуктов`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Категория успешно удалена' };
  }
}
