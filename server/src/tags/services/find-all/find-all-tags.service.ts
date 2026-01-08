import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FindAllTagsService {
  constructor(private prisma: PrismaService) {}

  async execute() {
    return this.prisma.tag.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
