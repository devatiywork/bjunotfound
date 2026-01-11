import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { normalizeBrandName } from '../../../utils/brand.utils';
import { CreateBrandDto } from '../../dto/create-brand.dto';

@Injectable()
export class CreateBrandService {
  constructor(private prisma: PrismaService) {}

  async execute(dto: CreateBrandDto, userId: string, isAdmin: boolean) {
    // 1. Генерация normalized_name
    const normalizedName = normalizeBrandName(dto.name);

    // 2. Проверка на дубликаты
    const existing = await this.prisma.brand.findUnique({
      where: { normalizedName },
    });

    if (existing) {
      throw new BadRequestException(
        `Бренд "${dto.name}" уже существует (ID: ${existing.id})`,
      );
    }

    // 3. Создание бренда
    // Если админ - бренд сразу одобрен, если пользователь - на модерации
    const brand = await this.prisma.brand.create({
      data: {
        name: dto.name,
        normalizedName,
        country: dto.country || null,
        photos: dto.photos || [],
        createdBy: userId,
        isApproved: isAdmin, // Админ создаёт сразу одобренный
        ...(isAdmin && {
          approvedBy: userId,
          approvedAt: new Date(),
        }),
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return brand;
  }
}
