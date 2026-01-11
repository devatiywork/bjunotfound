import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ApproveBrandService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, adminId: string) {
    // 1. Проверка существования бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Проверка статуса
    if (brand.isApproved) {
      throw new BadRequestException(`Бренд "${brand.name}" уже одобрен`);
    }

    // 3. Одобрение бренда
    const approved = await this.prisma.brand.update({
      where: { id },
      data: {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectedAt: null, // Сброс предыдущего отклонения (если было)
        rejectionReason: null,
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

    return approved;
  }
}
