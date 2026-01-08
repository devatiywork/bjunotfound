import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddWeightDto } from '../../dto/add-weight.dto';

@Injectable()
export class AddWeightService {
  constructor(private prisma: PrismaService) {}

  /**
   * Добавление записи веса
   */
  async execute(userId: string, addWeightDto: AddWeightDto) {
    const weight = await this.prisma.weight.create({
      data: {
        userId,
        weight: addWeightDto.weight,
        date: addWeightDto.date ? new Date(addWeightDto.date) : new Date(),
      },
    });

    return weight;
  }
}
