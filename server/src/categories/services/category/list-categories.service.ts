import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface ListCategoriesQuery {
  onlyActive?: boolean;
  parentId?: string | null;
  search?: string;
}

@Injectable()
export class ListCategoriesService {
  constructor(private prisma: PrismaService) {}

  async execute(query: ListCategoriesQuery, isAdmin: boolean = false) {
    const { onlyActive, parentId, search } = query;

    // Фильтр по активности
    // Если админ и onlyActive явно не задан - показываем все
    // Если не админ - всегда показываем только активные (кроме явного false)
    let isActiveFilter = {};
    if (isAdmin) {
      // Админ видит все, если явно не указан onlyActive=true
      if (onlyActive === true) {
        isActiveFilter = { isActive: true };
      }
    } else {
      // Обычные пользователи всегда видят только активные
      isActiveFilter = { isActive: true };
    }

    // Фильтр по родителю
    const parentFilter =
      parentId !== undefined ? { parentId: parentId || null } : {};

    // Фильтр по поиску
    const searchFilter = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const where = {
      ...isActiveFilter,
      ...parentFilter,
      ...searchFilter,
    };

    // Получение категорий с подсчётом
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              children: true,
              productsGlobal: true,
              productsUser: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      categories,
      total,
    };
  }
}
