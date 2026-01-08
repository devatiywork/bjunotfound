import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FilterProductsDto } from '../../dto/filter-products.dto';

@Injectable()
export class FindAllProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить список продуктов с фильтрацией и пагинацией
   */
  async execute(filters: FilterProductsDto, userId?: string) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      tagIds,
      minCalories,
      maxCalories,
      minPrice,
      maxPrice,
      source,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // максимум 100 на страницу

    // Построим where через AND, чтобы разные OR не перезаписывали друг друга
    const andConditions: Prisma.ProductWhereInput[] = [];

    // Публичные продукты или свои (любые, включая приватные)
    const publicOrOwn: Prisma.ProductWhereInput[] = [{ isPublic: true }];
    if (userId) {
      publicOrOwn.push({ userId });
    }

    andConditions.push({ OR: publicOrOwn });

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { brand: { contains: search, mode: 'insensitive' as const } },
        ],
      });
    }

    if (categoryId) {
      andConditions.push({ categoryId });
    }

    if (tagIds?.length) {
      andConditions.push({ tags: { some: { tagId: { in: tagIds } } } });
    }

    if (minCalories !== undefined) {
      andConditions.push({ calories: { gte: minCalories } });
    }

    if (maxCalories !== undefined) {
      andConditions.push({ calories: { lte: maxCalories } });
    }

    if (minPrice !== undefined && userId) {
      // Фильтр по цене работает только для авторизованных пользователей
      andConditions.push({
        userPrices: {
          some: {
            userId,
            price: { gte: minPrice },
          },
        },
      });
    }

    if (maxPrice !== undefined && userId) {
      andConditions.push({
        userPrices: {
          some: {
            userId,
            price: { lte: maxPrice },
          },
        },
      });
    }

    if (source) {
      andConditions.push({ source });
    }

    if (isVerified !== undefined) {
      andConditions.push({ isVerified });
    }

    const where: Prisma.ProductWhereInput =
      andConditions.length === 1 ? andConditions[0] : { AND: andConditions };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
            },
          },
          userPrices: userId
            ? {
                where: { userId },
                select: { price: true },
              }
            : false,
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Добавляем price в каждый продукт
    const productsWithPrice = products.map((product) => ({
      ...product,
      price:
        product.userPrices && product.userPrices.length > 0
          ? product.userPrices[0].price
          : null,
      userPrices: undefined, // убираем из ответа
    }));

    return {
      products: productsWithPrice,
      pagination: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
