import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteBrandService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string) {
    // 1. Проверка существования бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Проверка использования бренда
    const totalProducts =
      brand._count.productsGlobal + brand._count.productsUser;

    if (totalProducts > 0) {
      throw new BadRequestException(
        `Невозможно удалить бренд "${brand.name}": используется в ${totalProducts} продуктах`,
      );
    }

    // 3. Удаление бренда
    await this.prisma.brand.delete({
      where: { id },
    });

    return { message: `Бренд "${brand.name}" успешно удален` };
  }
}
