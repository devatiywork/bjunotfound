import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateServingDto } from '../../dto/update-serving.dto';

@Injectable()
export class UpdateServingService {
  constructor(private prisma: PrismaService) {}

  async execute(
    productId: string,
    servingId: string,
    dto: UpdateServingDto,
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
        'Нет прав для обновления порции этого продукта',
      );
    }

    // 3. Проверка существования порции
    const serving = await this.prisma.productUserServing.findUnique({
      where: { id: servingId },
    });

    if (!serving) {
      throw new NotFoundException(`Порция с ID "${servingId}" не найдена`);
    }

    if (serving.productUserId !== productId) {
      throw new NotFoundException('Порция не принадлежит этому продукту');
    }

    // 4. Если isDefault=true - сбросить у других порций
    if (dto.isDefault === true) {
      await this.prisma.productUserServing.updateMany({
        where: {
          productUserId: productId,
          id: { not: servingId },
        },
        data: { isDefault: false },
      });
    }

    // 5. Обновление порции
    const updated = await this.prisma.productUserServing.update({
      where: { id: servingId },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        amountUnits:
          dto.amountUnits !== undefined ? dto.amountUnits : undefined,
        weightG: dto.weightG !== undefined ? dto.weightG : undefined,
        volumeMl: dto.volumeMl !== undefined ? dto.volumeMl : undefined,
        isDefault: dto.isDefault !== undefined ? dto.isDefault : undefined,
      },
    });

    return updated;
  }
}
