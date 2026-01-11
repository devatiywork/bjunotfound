import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddServingDto } from '../../dto/add-serving.dto';

@Injectable()
export class AddServingService {
  constructor(private prisma: PrismaService) {}

  async execute(productId: string, dto: AddServingDto, userId: string) {
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
        'Нет прав для добавления порции к этому продукту',
      );
    }

    // 3. Валидация: хотя бы одно из weightG/volumeMl
    if (!dto.weightG && !dto.volumeMl) {
      throw new BadRequestException(
        'Необходимо указать хотя бы одно: weightG или volumeMl',
      );
    }

    // 4. Если isDefault=true - сбросить у других порций
    if (dto.isDefault) {
      await this.prisma.productUserServing.updateMany({
        where: { productUserId: productId },
        data: { isDefault: false },
      });
    }

    // 5. Создание порции
    const serving = await this.prisma.productUserServing.create({
      data: {
        productUserId: productId,
        name: dto.name,
        amountUnits: dto.amountUnits || 1,
        weightG: dto.weightG || null,
        volumeMl: dto.volumeMl || null,
        isDefault: dto.isDefault || false,
      },
    });

    return serving;
  }
}
