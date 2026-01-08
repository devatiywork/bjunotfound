import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface CreateTagDto {
  name: string;
}

@Injectable()
export class CreateTagService {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateTagDto) {
    // Проверка уникальности имени
    const existing = await this.prisma.tag.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException('Тег с таким именем уже существует');
    }

    return this.prisma.tag.create({
      data,
    });
  }
}
