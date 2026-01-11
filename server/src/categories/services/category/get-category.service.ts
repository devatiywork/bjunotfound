import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetCategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить категорию по ID
   */
  async execute(id: string, isAdmin: boolean = false) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            photos: true,
            isActive: true,
          },
          where: isAdmin ? {} : { isActive: true },
        },
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // Если категория неактивна и запрос не от админа - 404
    if (!category.isActive && !isAdmin) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    return category;
  }

  /**
   * Получить категорию по slug
   */
  async executeBySlug(slug: string, isAdmin: boolean = false) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            photos: true,
            isActive: true,
          },
          where: isAdmin ? {} : { isActive: true },
        },
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Категория с slug "${slug}" не найдена`);
    }

    // Если категория неактивна и запрос не от админа - 404
    if (!category.isActive && !isAdmin) {
      throw new NotFoundException(`Категория с slug "${slug}" не найдена`);
    }

    return category;
  }
}
