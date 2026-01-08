import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FindOneTagService {
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

    return tag;
  }
}
