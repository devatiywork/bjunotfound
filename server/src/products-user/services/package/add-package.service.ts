import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddPackageDto } from '../../dto/add-package.dto';

@Injectable()
export class AddPackageService {
  constructor(private prisma: PrismaService) {}

  async execute(productId: string, dto: AddPackageDto, userId: string) {
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
        'Нет прав для добавления упаковки к этому продукту',
      );
    }

    // 3. Валидация: хотя бы одно из totalWeightG/totalVolumeMl
    if (!dto.totalWeightG && !dto.totalVolumeMl) {
      throw new BadRequestException(
        'Необходимо указать хотя бы одно: totalWeightG или totalVolumeMl',
      );
    }

    // 4. Создание упаковки
    const packageItem = await this.prisma.productUserPackage.create({
      data: {
        productUserId: productId,
        totalWeightG: dto.totalWeightG || null,
        totalVolumeMl: dto.totalVolumeMl || null,
        priceTotal: dto.priceTotal,
        currency: dto.currency,
        purchasedAt: dto.purchasedAt ? new Date(dto.purchasedAt) : null,
        store: dto.store || null,
        note: dto.note || null,
      },
    });

    return packageItem;
  }
}
