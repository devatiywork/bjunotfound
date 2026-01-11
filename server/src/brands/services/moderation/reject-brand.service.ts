import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RejectBrandDto } from '../../dto/reject-brand.dto';

@Injectable()
export class RejectBrandService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, dto: RejectBrandDto) {
    // 1. Проверка существования бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Проверка статуса
    if (brand.isApproved) {
      throw new BadRequestException(
        `Невозможно отклонить одобренный бренд "${brand.name}"`,
      );
    }

    // 3. Отклонение бренда
    const rejected = await this.prisma.brand.update({
      where: { id },
      data: {
        rejectedAt: new Date(),
        rejectionReason: dto.reason,
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

    return rejected;
  }
}
