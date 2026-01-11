import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateUniqueSlug } from '../../../utils/slug.utils';
import { CreateCategoryDto } from '../../dto/create-category.dto';

@Injectable()
export class CreateCategoryService {
  constructor(private prisma: PrismaService) {}

  async execute(dto: CreateCategoryDto) {
    // 1. Проверка родительской категории, если указана
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new BadRequestException(
          `Родительская категория с ID "${dto.parentId}" не найдена`,
        );
      }
    }

    // 2. Генерация slug, если не указан
    let slug = dto.slug;
    if (!slug) {
      slug = await generateUniqueSlug(dto.name, async (s) => {
        const existing = await this.prisma.category.findUnique({
          where: { slug: s },
        });
        return !!existing;
      });
    } else {
      // Проверка уникальности переданного slug
      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new BadRequestException(`Slug "${slug}" уже занят`);
      }
    }

    // 3. Создание категории
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId || null,
        photos: dto.photos || [],
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    return category;
  }
}
