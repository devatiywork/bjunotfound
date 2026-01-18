import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListBrandsService {
  constructor(private prisma: PrismaService) {}

  async execute(isAdmin: boolean, userId?: string) {
    // Для администраторов - все бренды
    // Для обычных пользователей - одобренные + свои неодобренные (но не отклонённые)
    let where: any = {};

    if (isAdmin) {
      // Админ видит все
      where = {};
    } else if (userId) {
      // Авторизованный пользователь видит:
      // 1. Все одобренные бренды
      // 2. Свои неодобренные бренды (но НЕ отклонённые)
      where = {
        OR: [
          { isApproved: true },
          { createdBy: userId, isApproved: false, rejectedAt: null },
        ],
      };
    } else {
      // Неавторизованный пользователь видит только одобренные
      where = { isApproved: true };
    }

    const brands = await this.prisma.brand.findMany({
      where,
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
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
      orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
    });

    return brands;
  }
}
