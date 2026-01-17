import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const MealStatisticsSwaggerDocs = {
  getPeriodStats: {
    summary: 'Получить статистику за период',
    description: `
Возвращает агрегированную статистику по событиям питания за указанный период.

**Включает:**
- Общее количество событий по статусам
- Процент выполнения плана
- Суммарное и среднее КБЖУ за период
- Топ-5 самых частых блюд

**Период по умолчанию:** последние 7 дней

**Важно:** В расчёт КБЖУ включаются только события со статусом COMPLETED.
    `,
  } as ApiOperationOptions,

  getCalendarStats: {
    summary: 'Получить статистику по дням (календарь)',
    description: `
Возвращает статистику по дням для отображения в календаре.

**Включает:**
- Список дней с количеством событий и калориями
- Общую сводку по периоду

**Период по умолчанию:** текущий месяц

**Использование:** Идеально для визуализации в виде календаря или heatmap.
    `,
  } as ApiOperationOptions,

  getShoppingList: {
    summary: 'Получить список покупок',
    description: `
Генерирует список продуктов для покупки на основе запланированных событий.

**Включает:**
- Сгруппированные продукты с общим весом/количеством
- Детализацию по блюдам и датам
- Названия брендов (если есть)

**Период по умолчанию:** следующие 7 дней

**Важно:** Учитываются только события со статусом PLANNED.
    `,
  } as ApiOperationOptions,

  getDailyNutrition: {
    summary: 'Получить дневное питание',
    description: `
Возвращает детальную информацию о питании за конкретный день.

**Включает:**
- События сгруппированные по типам приёмов пищи
- КБЖУ для каждого события и итоги по приёму пищи
- Общее потреблённое и запланированное КБЖУ
- Сравнение с целью (если есть активная цель)
- Остаток калорий до цели

**Дата по умолчанию:** сегодня
    `,
  } as ApiOperationOptions,
};

export const MealStatisticsSwaggerResponses = {
  periodStats: {
    status: 200,
    description: 'Статистика за период успешно получена',
    schema: {
      example: {
        period: {
          startDate: '2025-01-08',
          endDate: '2025-01-15',
          totalDays: 7,
        },
        events: {
          total: 21,
          completed: 18,
          skipped: 1,
          planned: 2,
          completionRate: 86,
        },
        nutrition: {
          total: {
            calories: 14000,
            proteins: 560.5,
            fats: 420.3,
            carbs: 1750.8,
          },
          averagePerDay: {
            calories: 2000,
            proteins: 80.1,
            fats: 60.0,
            carbs: 250.1,
          },
        },
        dishes: {
          uniqueCount: 12,
          mostFrequent: [
            {
              dishId: 'uuid-1',
              dishName: 'Овсянка с ягодами',
              count: 5,
            },
            {
              dishId: 'uuid-2',
              dishName: 'Куриная грудка с рисом',
              count: 4,
            },
          ],
        },
      },
    },
  } as ApiResponseOptions,

  calendarStats: {
    status: 200,
    description: 'Статистика по дням успешно получена',
    schema: {
      example: {
        period: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        },
        days: [
          {
            date: '2025-01-15',
            events: {
              total: 3,
              completed: 2,
              skipped: 0,
              planned: 1,
            },
            calories: 1850,
          },
        ],
        summary: {
          totalDays: 31,
          daysWithEvents: 28,
          averageEventsPerDay: 3.2,
          averageCaloriesPerDay: 1920,
        },
      },
    },
  } as ApiResponseOptions,

  shoppingList: {
    status: 200,
    description: 'Список покупок успешно сформирован',
    schema: {
      example: {
        period: {
          startDate: '2025-01-15',
          endDate: '2025-01-22',
        },
        items: [
          {
            productId: 'uuid-1',
            productName: 'Куриная грудка',
            brandName: 'Петелинка',
            totalGrams: 1200,
            totalPieces: null,
            unit: 'grams',
            events: [
              {
                eventId: 'uuid-event-1',
                dishName: 'Куриная грудка с рисом',
                date: '2025-01-16',
                grams: 300,
              },
            ],
          },
          {
            productId: 'uuid-2',
            productName: 'Яйцо куриное',
            brandName: null,
            totalGrams: 360,
            totalPieces: 6,
            unit: 'pieces',
            events: [
              {
                eventId: 'uuid-event-2',
                dishName: 'Омлет',
                date: '2025-01-17',
                grams: 180,
              },
            ],
          },
        ],
        summary: {
          totalProducts: 15,
          totalEvents: 21,
        },
      },
    },
  } as ApiResponseOptions,

  dailyNutrition: {
    status: 200,
    description: 'Дневное питание успешно получено',
    schema: {
      example: {
        date: '2025-01-15',
        meals: [
          {
            mealTypeId: 'uuid-breakfast',
            mealTypeName: 'Завтрак',
            events: [
              {
                eventId: 'uuid-1',
                dishId: 'uuid-dish-1',
                dishName: 'Овсянка с ягодами',
                portions: 1,
                status: 'COMPLETED',
                startAt: '2025-01-15T08:00:00.000Z',
                nutrition: {
                  calories: 350,
                  proteins: 12.5,
                  fats: 8.2,
                  carbs: 55.3,
                },
              },
            ],
            totals: {
              calories: 350,
              proteins: 12.5,
              fats: 8.2,
              carbs: 55.3,
            },
          },
        ],
        totals: {
          consumed: {
            calories: 1650,
            proteins: 85.2,
            fats: 52.1,
            carbs: 195.8,
          },
          planned: {
            calories: 450,
            proteins: 25.0,
            fats: 15.0,
            carbs: 60.0,
          },
        },
        goal: {
          calories: 2000,
          proteins: null,
          fats: null,
          carbs: null,
        },
        remaining: {
          calories: 350,
          proteins: null,
          fats: null,
          carbs: null,
        },
      },
    },
  } as ApiResponseOptions,

  unauthorized: {
    status: 401,
    description: 'Не авторизован',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  } as ApiResponseOptions,
};
