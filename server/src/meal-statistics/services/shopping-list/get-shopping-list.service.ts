import { Injectable } from '@nestjs/common';
import { MealEventStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { GetPeriodStatsDto } from '../../dto/index.js';

interface ShoppingItem {
  productId: string;
  productName: string;
  brandName: string | null;
  totalGrams: number;
  /** Расчётная цена за нужное количество продукта */
  estimatedPrice: number | null;
  /** Цена за грамм (из последней покупки) */
  pricePerGram: number | null;
  /** Валюта */
  currency: string | null;
  events: Array<{
    eventId: string;
    dishName: string;
    date: string;
    grams: number;
  }>;
}

export interface ShoppingList {
  period: { startDate: string; endDate: string };
  items: ShoppingItem[];
  summary: {
    totalProducts: number;
    totalEvents: number;
    /** Общая расчётная стоимость всех продуктов */
    totalEstimatedPrice: number | null;
    /** Валюта */
    currency: string | null;
    /** Количество продуктов без информации о цене */
    productsWithoutPrice: number;
  };
}

@Injectable()
export class GetShoppingListService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, dto: GetPeriodStatsDto): Promise<ShoppingList> {
    const startDate = dto.startDate || new Date();
    const endDate =
      dto.endDate || new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await this.prisma.mealEvent.findMany({
      where: {
        userId,
        isArchived: false,
        status: MealEventStatus.PLANNED,
        startAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        dish: {
          include: {
            items: {
              include: {
                productUser: {
                  include: {
                    names: true,
                    brand: true,
                    packages: {
                      orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }],
                      take: 1, // берём только последнюю покупку
                    },
                  },
                },
                serving: true,
              },
            },
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    // Временная структура для накопления данных
    interface TempProductData {
      productId: string;
      productName: string;
      brandName: string | null;
      totalGrams: number;
      lastPackage: {
        totalWeightG: number | null;
        totalVolumeMl: number | null;
        priceTotal: number;
        currency: string;
      } | null;
      events: Array<{
        eventId: string;
        dishName: string;
        date: string;
        grams: number;
      }>;
    }

    const productMap = new Map<string, TempProductData>();

    for (const event of events) {
      for (const item of event.dish.items || []) {
        const grams =
          (this.resolveGrams(item) * event.portions) / event.dish.portions;
        const productId = item.productUser.id;
        const productName = item.productUser.names[0]?.name || 'Без названия';
        const brandName = item.productUser.brand?.name || null;
        const lastPackage = item.productUser.packages[0] || null;

        const eventInfo = {
          eventId: event.id,
          dishName: event.dish.name,
          date: event.startAt.toISOString().split('T')[0],
          grams: Math.round(grams),
        };

        const existing = productMap.get(productId);
        if (existing) {
          existing.totalGrams += grams;
          existing.events.push(eventInfo);
        } else {
          productMap.set(productId, {
            productId,
            productName,
            brandName,
            totalGrams: grams,
            lastPackage: lastPackage
              ? {
                  totalWeightG: lastPackage.totalWeightG,
                  totalVolumeMl: lastPackage.totalVolumeMl,
                  priceTotal: lastPackage.priceTotal,
                  currency: lastPackage.currency,
                }
              : null,
            events: [eventInfo],
          });
        }
      }
    }

    // Расчёт цен и формирование итоговых items
    let totalEstimatedPrice = 0;
    let currency: string | null = null;
    let productsWithoutPrice = 0;

    const items: ShoppingItem[] = Array.from(productMap.values())
      .sort((a, b) => a.productName.localeCompare(b.productName, 'ru'))
      .map((product) => {
        const totalGrams = Math.round(product.totalGrams);
        const priceInfo = this.calculatePrice(product.lastPackage, totalGrams);

        if (priceInfo.estimatedPrice !== null) {
          totalEstimatedPrice += priceInfo.estimatedPrice;
          if (!currency) currency = priceInfo.currency;
        } else {
          productsWithoutPrice++;
        }

        return {
          productId: product.productId,
          productName: product.productName,
          brandName: product.brandName,
          totalGrams,
          estimatedPrice: priceInfo.estimatedPrice,
          pricePerGram: priceInfo.pricePerGram,
          currency: priceInfo.currency,
          events: product.events,
        };
      });

    return {
      period: {
        startDate: startOfDay.toISOString().split('T')[0],
        endDate: endOfDay.toISOString().split('T')[0],
      },
      items,
      summary: {
        totalProducts: items.length,
        totalEvents: events.length,
        totalEstimatedPrice:
          totalEstimatedPrice > 0
            ? Math.round(totalEstimatedPrice * 100) / 100
            : null,
        currency,
        productsWithoutPrice,
      },
    };
  }

  /**
   * Рассчитывает цену продукта на основе последней покупки
   */
  private calculatePrice(
    lastPackage: {
      totalWeightG: number | null;
      totalVolumeMl: number | null;
      priceTotal: number;
      currency: string;
    } | null,
    grams: number,
  ): {
    estimatedPrice: number | null;
    pricePerGram: number | null;
    currency: string | null;
  } {
    if (!lastPackage) {
      return { estimatedPrice: null, pricePerGram: null, currency: null };
    }

    let pricePerUnit: number | null = null;

    // Если покупка в граммах
    if (lastPackage.totalWeightG && lastPackage.totalWeightG > 0) {
      pricePerUnit = lastPackage.priceTotal / lastPackage.totalWeightG;
    }
    // Если покупка в миллилитрах (приравниваем к граммам)
    else if (lastPackage.totalVolumeMl && lastPackage.totalVolumeMl > 0) {
      pricePerUnit = lastPackage.priceTotal / lastPackage.totalVolumeMl;
    }

    if (pricePerUnit === null) {
      return { estimatedPrice: null, pricePerGram: null, currency: null };
    }

    const estimatedPrice = Math.round(pricePerUnit * grams * 100) / 100;
    const pricePerGram = Math.round(pricePerUnit * 10000) / 10000; // 4 знака после запятой

    return {
      estimatedPrice,
      pricePerGram,
      currency: lastPackage.currency,
    };
  }

  private resolveGrams(item: any): number {
    if (item.amountG !== null) return item.amountG;
    if (item.amountMl !== null) return item.amountMl;
    if (item.servingsCount !== null && item.serving) {
      // Порция может быть в граммах или миллилитрах
      if (item.serving.weightG)
        return item.servingsCount * item.serving.weightG;
      if (item.serving.volumeMl)
        return item.servingsCount * item.serving.volumeMl;
    }
    return 0;
  }
}
