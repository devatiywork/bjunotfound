import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProductDto } from '../../dto/update-product.dto';

@Injectable()
export class UpdateProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * Обновить продукт
   */
  async execute(
    id: string,
    userId: string,
    dto: UpdateProductDto,
    isAdmin: boolean,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Проверка прав: админ или владелец
    if (!isAdmin && product.userId !== userId) {
      throw new ForbiddenException('Недостаточно прав для редактирования');
    }

    // Валидация категории (если обновляется)
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Категория не найдена');
      }
    }

    // Валидация тегов (если обновляются)
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: dto.tagIds } },
      });

      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('Один или несколько тегов не найдены');
      }
    }

    // Проверка уникальности штрих-кода (если обновляется)
    if (dto.barcode && dto.barcode !== product.barcode) {
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

    // Обновление продукта с тегами
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {}, // Удаляем старые связи
            create: tagIds.map((tagId) => ({ tagId })), // Создаем новые
          },
        }),
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

    // Обновляем персональную цену если передана
    if (price !== undefined) {
      const existingPrice = await this.prisma.userProductPrice.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: id,
          },
        },
      });

      if (existingPrice) {
        await this.prisma.userProductPrice.update({
          where: { id: existingPrice.id },
          data: { price },
        });
      } else {
        await this.prisma.userProductPrice.create({
          data: {
            userId,
            productId: id,
            price,
          },
        });
      }
    }

    // Получаем текущую цену для ответа
    const userPrice = await this.prisma.userProductPrice.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: id,
        },
      },
    });

    return {
      ...updatedProduct,
      price: userPrice?.price || null,
    };
  }
}
