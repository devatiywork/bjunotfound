import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface UpdateTagDto {
  name?: string;
}

@Injectable()
export class UpdateTagService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, data: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    // Проверка уникальности имени (если обновляется)
    if (data.name && data.name !== tag.name) {
      const existing = await this.prisma.tag.findUnique({
        where: { name: data.name },
      });

      if (existing) {
        throw new BadRequestException('Тег с таким именем уже существует');
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }
}
