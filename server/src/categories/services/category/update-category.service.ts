import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateCategoryDto } from '../../dto/update-category.dto';

@Injectable()
export class UpdateCategoryService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, dto: UpdateCategoryDto) {
    // 1. Проверка существования категории
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // 2. Проверка родительской категории, если обновляется
    if (dto.parentId !== undefined) {
      if (dto.parentId !== null) {
        // Проверка существования родителя
        const parent = await this.prisma.category.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          throw new BadRequestException(
            `Родительская категория с ID "${dto.parentId}" не найдена`,
          );
        }

        // Проверка: нельзя установить самого себя в качестве родителя
        if (dto.parentId === id) {
          throw new BadRequestException(
            'Категория не может быть родителем самой себя',
          );
        }

        // Проверка циклической зависимости
        const hasCycle = await this.checkCyclicDependency(
          id,
          dto.parentId,
          new Set(),
        );
        if (hasCycle) {
          throw new BadRequestException(
            'Обнаружена циклическая зависимость: категория не может быть потомком своего собственного потомка',
          );
        }
      }
    }

    // 3. Проверка уникальности slug, если обновляется
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new BadRequestException(`Slug "${dto.slug}" уже занят`);
      }
    }

    // 4. Обновление категории
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.photos && { photos: dto.photos }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return updated;
  }

  /**
   * Проверка циклической зависимости в дереве категорий
   * @param categoryId - ID проверяемой категории
   * @param newParentId - ID нового родителя
   * @param visited - множество посещенных узлов
   * @returns true, если обнаружен цикл
   */
  private async checkCyclicDependency(
    categoryId: string,
    newParentId: string,
    visited: Set<string>,
  ): Promise<boolean> {
    // Если новый родитель - это сама категория, цикл обнаружен
    if (newParentId === categoryId) {
      return true;
    }

    // Если уже посещали этот узел, цикл обнаружен
    if (visited.has(newParentId)) {
      return true;
    }

    visited.add(newParentId);

    // Получаем родителя нового родителя
    const parent = await this.prisma.category.findUnique({
      where: { id: newParentId },
      select: { parentId: true },
    });

    // Если у нового родителя нет родителя, цикла нет
    if (!parent || !parent.parentId) {
      return false;
    }

    // Рекурсивно проверяем предков
    return this.checkCyclicDependency(categoryId, parent.parentId, visited);
  }
}
