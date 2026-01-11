import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteCategoryService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string) {
    // 1. Проверка существования категории
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // 2. Проверка наличия подкатегорий
    if (category._count.children > 0) {
      throw new BadRequestException(
        `Невозможно удалить категорию: у неё есть ${category._count.children} подкатегорий. ` +
          `Сначала удалите или переместите подкатегории.`,
      );
    }

    // 3. Проверка наличия продуктов
    const totalProducts =
      category._count.productsGlobal + category._count.productsUser;
    if (totalProducts > 0) {
      throw new BadRequestException(
        `Невозможно удалить категорию: в ней ${totalProducts} продуктов. ` +
          `Сначала переместите или удалите продукты.`,
      );
    }

    // 4. Удаление категории
    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Категория успешно удалена',
      deletedId: id,
    };
  }
}
