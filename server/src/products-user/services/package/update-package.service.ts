import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdatePackageDto } from '../../dto/update-package.dto';

@Injectable()
export class UpdatePackageService {
  constructor(private prisma: PrismaService) {}

  async execute(
    productId: string,
    packageId: string,
    dto: UpdatePackageDto,
    userId: string,
  ) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${productId}" не найден`);
    }

    // 2. Проверка владельца
    if (product.userId !== userId) {
      throw new ForbiddenException(
        'Нет прав для обновления упаковки этого продукта',
      );
    }

    // 3. Проверка существования упаковки
    const packageItem = await this.prisma.productUserPackage.findUnique({
      where: { id: packageId },
    });

    if (!packageItem) {
      throw new NotFoundException(`Упаковка с ID "${packageId}" не найдена`);
    }

    if (packageItem.productUserId !== productId) {
      throw new NotFoundException('Упаковка не принадлежит этому продукту');
    }

    // 4. Обновление упаковки
    const updated = await this.prisma.productUserPackage.update({
      where: { id: packageId },
      data: {
        totalWeightG:
          dto.totalWeightG !== undefined ? dto.totalWeightG : undefined,
        totalVolumeMl:
          dto.totalVolumeMl !== undefined ? dto.totalVolumeMl : undefined,
        priceTotal: dto.priceTotal !== undefined ? dto.priceTotal : undefined,
        currency: dto.currency !== undefined ? dto.currency : undefined,
        purchasedAt:
          dto.purchasedAt !== undefined ? new Date(dto.purchasedAt) : undefined,
        store: dto.store !== undefined ? dto.store : undefined,
        note: dto.note !== undefined ? dto.note : undefined,
      },
    });

    return updated;
  }
}
