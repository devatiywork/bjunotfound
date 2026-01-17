import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const MealEventsSwaggerDocs = {
  create: {
    summary: 'Создать событие питания',
    description:
      'Создает новое событие питания - назначает блюдо на конкретную дату-время.',
  } as ApiOperationOptions,

  getById: {
    summary: 'Получить событие по ID',
    description:
      'Возвращает детальную информацию о событии с расчетом КБЖУ и цены.',
  } as ApiOperationOptions,

  getByPeriod: {
    summary: 'Получить события за период',
    description:
      'Возвращает все события питания за указанный период. Поддерживает фильтрацию по статусу и типу приема пищи.',
  } as ApiOperationOptions,

  update: {
    summary: 'Обновить событие',
    description:
      'Обновляет данные события: время, блюдо, количество порций, тип приема пищи, комментарий.',
  } as ApiOperationOptions,

  changeStatus: {
    summary: 'Изменить статус события',
    description:
      'Изменяет статус события на COMPLETED (выполнено) или SKIPPED (пропущено). Записывается completedAt.',
  } as ApiOperationOptions,

  archive: {
    summary: 'Удалить событие',
    description:
      'Архивирует (мягкое удаление) событие питания. Восстановление невозможно.',
  } as ApiOperationOptions,
};

export const MealEventsSwaggerResponses = {
  eventCreated: {
    status: 201,
    description: 'Событие успешно создано',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-id',
        startAt: '2026-01-20T08:00:00.000Z',
        dishId: 'dish-id',
        portions: 1.5,
        mealTypeId: 'meal-type-id',
        note: 'С огурцами',
        status: 'PLANNED',
        timezone: 'Europe/Moscow',
        completedAt: null,
        isArchived: false,
        createdAt: '2026-01-16T12:00:00.000Z',
        updatedAt: '2026-01-16T12:00:00.000Z',
        dish: {
          id: 'dish-id',
          name: 'Омлет с сыром',
          portions: 2,
          photos: [],
        },
        mealType: {
          id: 'meal-type-id',
          name: 'Завтрак',
          code: 'BREAKFAST',
        },
      },
    },
  } as ApiResponseOptions,

  eventDetails: {
    status: 200,
    description: 'Детальная информация о событии',
    schema: {
      example: {
        id: 'event-id',
        startAt: '2026-01-20T08:00:00.000Z',
        portions: 1.5,
        status: 'PLANNED',
        dish: {
          id: 'dish-id',
          name: 'Омлет с сыром',
          portions: 2,
        },
        computed: {
          perPortion: {
            calories: 250,
            protein: 15,
            fat: 18,
            carbs: 5,
            price: 50,
          },
          total: {
            calories: 375,
            protein: 22.5,
            fat: 27,
            carbs: 7.5,
            price: 75,
          },
          issues: [],
        },
      },
    },
  } as ApiResponseOptions,

  eventsList: {
    status: 200,
    description: 'Список событий за период',
    schema: {
      example: {
        period: {
          startDate: '2026-01-20',
          endDate: '2026-01-27',
        },
        events: [],
        summary: {
          totalEvents: 21,
          planned: 15,
          completed: 5,
          skipped: 1,
        },
      },
    },
  } as ApiResponseOptions,

  eventUpdated: {
    status: 200,
    description: 'Событие успешно обновлено',
  } as ApiResponseOptions,

  statusChanged: {
    status: 200,
    description: 'Статус события изменен',
    schema: {
      example: {
        id: 'event-id',
        status: 'COMPLETED',
        completedAt: '2026-01-20T08:30:00.000Z',
      },
    },
  } as ApiResponseOptions,

  eventArchived: {
    status: 200,
    description: 'Событие успешно удалено',
    schema: {
      example: {
        id: 'event-id',
        isArchived: true,
        deletedAt: '2026-01-16T14:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  notFound: {
    status: 404,
    description: 'Событие, блюдо или тип приема пищи не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'Событие питания не найдено',
        error: 'Not Found',
      },
    },
  } as ApiResponseOptions,

  forbidden: {
    status: 403,
    description: 'Нет доступа к событию',
    schema: {
      example: {
        statusCode: 403,
        message: 'Нет доступа к этому событию',
        error: 'Forbidden',
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

  badRequest: {
    status: 400,
    description: 'Ошибка валидации данных',
    schema: {
      example: {
        statusCode: 400,
        message: ['portions must be greater than 0.1'],
        error: 'Bad Request',
      },
    },
  } as ApiResponseOptions,
};
