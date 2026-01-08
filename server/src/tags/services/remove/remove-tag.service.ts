import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveTagService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    if (tag._count.products > 0) {
      throw new BadRequestException(
        `Невозможно удалить тег: к нему привязано ${tag._count.products} продуктов`,
      );
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: 'Тег успешно удален' };
  }
}
