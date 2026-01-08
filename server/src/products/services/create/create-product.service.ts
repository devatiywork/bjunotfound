import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from '../../dto/create-product.dto';

@Injectable()
export class CreateProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создать новый продукт
   */
  async execute(
    userId: string | null,
    dto: CreateProductDto,
    isAdmin: boolean,
  ) {
    // Валидация категории
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Категория не найдена');
    }

    // Валидация тегов (если указаны)
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: dto.tagIds } },
      });

      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('Один или несколько тегов не найдены');
      }
    }

    // Проверка уникальности штрих-кода
    if (dto.barcode) {
      const existing = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existing) {
        throw new BadRequestException(
          'Продукт с таким штрих-кодом уже существует',
        );
      }
    }

    const { tagIds, price, ...productData } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        userId,
        source: isAdmin ? 'ADMIN' : 'USER',
        isVerified: isAdmin,
        tags: {
          create: tagIds?.map((tagId) => ({ tagId })) || [],
        },
      },
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
      },
    });

    // Создаем персональную цену если указана
    if (price !== undefined && userId) {
      await this.prisma.userProductPrice.create({
        data: {
          userId,
          productId: product.id,
          price,
        },
      });
    }

    // Добавляем цену в ответ
    return {
      ...product,
      price: price !== undefined ? price : null,
    };
  }
}
