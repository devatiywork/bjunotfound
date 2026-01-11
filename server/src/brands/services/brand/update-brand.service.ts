import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { normalizeBrandName } from '../../../utils/brand.utils';
import { UpdateBrandDto } from '../../dto/update-brand.dto';

@Injectable()
export class UpdateBrandService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, dto: UpdateBrandDto) {
    // 1. Проверка существования бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Если меняется название - проверка normalized_name на дубликаты
    let normalizedName = brand.normalizedName;
    if (dto.name && dto.name !== brand.name) {
      normalizedName = normalizeBrandName(dto.name);

      const existing = await this.prisma.brand.findUnique({
        where: { normalizedName },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Бренд "${dto.name}" уже существует (ID: ${existing.id})`,
        );
      }
    }

    // 3. Обновление бренда
    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name, normalizedName }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.photos && { photos: dto.photos }),
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}
