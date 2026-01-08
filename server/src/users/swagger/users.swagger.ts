import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

/**
 * Описания операций для Swagger документации Users модуля
 */
export const UsersSwaggerDocs = {
  // Профиль
  getProfile: {
    summary: 'Получить профиль текущего пользователя',
    description:
      'Возвращает полный профиль пользователя с информацией о роли и уровне активности',
  } as ApiOperationOptions,

  updateProfile: {
    summary: 'Обновить профиль пользователя',
    description:
      'Обновление данных пользователя: пол, дата рождения, рост, формула расчета, уровень активности',
  } as ApiOperationOptions,

  // Управление весом
  addWeight: {
    summary: 'Добавить запись веса',
    description:
      'Создает новую запись веса. Автоматически пересчитывает активные цели на основе нового веса.',
  } as ApiOperationOptions,

  getWeightHistory: {
    summary: 'Получить историю веса',
    description: 'Возвращает последние 50 записей веса пользователя',
  } as ApiOperationOptions,

  getLatestWeight: {
    summary: 'Получить последний вес',
    description: 'Возвращает самую свежую запись веса пользователя',
  } as ApiOperationOptions,

  getWeightByPeriod: {
    summary: 'Получить вес за период',
    description:
      'Возвращает все записи веса за указанный период с расчетом разницы между началом и концом',
  } as ApiOperationOptions,

  getAvailablePeriod: {
    summary: 'Получить доступный период данных',
    description:
      'Возвращает даты первой и последней записи веса для определения доступного диапазона',
  } as ApiOperationOptions,

  deleteWeight: {
    summary: 'Удалить запись веса',
    description:
      'Полностью удаляет запись веса из БД. После удаления автоматически пересчитываются активные цели. Пользователь может удалять только свои записи.',
  } as ApiOperationOptions,

  // Управление целями
  setGoal: {
    summary: 'Создать новую цель',
    description:
      'Создает новую цель по весу/калориям. Если есть активная цель, она деактивируется.',
  } as ApiOperationOptions,

  getGoal: {
    summary: 'Получить активную цель',
    description: 'Возвращает текущую активную цель пользователя',
  } as ApiOperationOptions,

  getGoalsHistory: {
    summary: 'Получить историю целей',
    description:
      'Возвращает все цели пользователя с автоматическим обновлением статусов',
  } as ApiOperationOptions,

  deactivateGoal: {
    summary: 'Деактивировать цель',
    description: 'Деактивирует текущую активную цель',
  } as ApiOperationOptions,

  // Справочники
  getActivityLevels: {
    summary: 'Получить уровни активности',
    description:
      'Возвращает список всех доступных уровней физической активности с коэффициентами',
  } as ApiOperationOptions,
};

/**
 * Примеры ответов для Swagger документации
 */
export const UsersSwaggerResponses = {
  profile: {
    status: 200,
    description: 'Профиль успешно получен',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        roleId: 'user',
        gender: 'MALE',
        birthDate: '1990-01-01T00:00:00.000Z',
        height: 180,
        formulaType: 'MIFFLIN_ST_JEOR',
        activityLevelId: 'moderate',
        role: {
          id: 'user',
          name: 'user',
          description: 'Обычный пользователь',
        },
        activityLevel: {
          id: 'moderate',
          name: 'Умеренная активность (3-5 раз в неделю)',
          description: 'Тренировки средней интенсивности 3-5 раз в неделю',
          coefficient: 1.55,
        },
        createdAt: '2025-12-01T00:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  weight: {
    status: 201,
    description: 'Запись веса успешно создана',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        weight: 75.5,
        date: '2025-12-21T10:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  weightCreated: {
    status: 201,
    description: 'Запись веса успешно создана',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        weight: 75.5,
        date: '2025-12-21T10:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  weightLatest: {
    status: 200,
    description: 'Последний вес получен',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        weight: 75.5,
        date: '2025-12-21T00:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  weightDeleted: {
    status: 200,
    description: 'Запись веса успешно удалена',
    schema: {
      example: {
        message: 'Запись веса успешно удалена',
      },
    },
  } as ApiResponseOptions,

  weightHistory: {
    status: 200,
    description: 'История веса получена',
    schema: {
      example: [
        {
          id: 'uuid',
          userId: 'uuid',
          weight: 75.5,
          date: '2025-12-21T00:00:00.000Z',
        },
        {
          id: 'uuid',
          userId: 'uuid',
          weight: 76.0,
          date: '2025-12-20T00:00:00.000Z',
        },
      ],
    },
  } as ApiResponseOptions,

  availablePeriod: {
    status: 200,
    description: 'Доступный период данных о весе',
    schema: {
      example: {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2025-12-31T00:00:00.000Z',
        totalRecords: 365,
      },
    },
  } as ApiResponseOptions,

  goal: {
    status: 201,
    description: 'Цель успешно создана',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        targetWeight: 70.0,
        targetCalories: 2000,
        startDate: '2025-12-21T00:00:00.000Z',
        endDate: '2026-03-21T00:00:00.000Z',
        status: 'IN_PROGRESS',
        isActive: true,
      },
    },
  } as ApiResponseOptions,

  goalCreated: {
    status: 201,
    description: 'Цель успешно создана или обновлена',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        targetWeight: 70.0,
        targetCalories: 2000,
        startDate: '2025-12-21T00:00:00.000Z',
        endDate: '2026-03-21T00:00:00.000Z',
        status: 'IN_PROGRESS',
        isActive: true,
      },
    },
  } as ApiResponseOptions,

  goalActive: {
    status: 200,
    description: 'Активная цель получена',
    schema: {
      example: {
        id: 'uuid',
        userId: 'uuid',
        targetWeight: 70.0,
        targetCalories: 2000,
        startDate: '2025-12-21T00:00:00.000Z',
        endDate: '2026-03-21T00:00:00.000Z',
        status: 'IN_PROGRESS',
        isActive: true,
      },
    },
  } as ApiResponseOptions,

  goalsHistory: {
    status: 200,
    description: 'История целей получена',
    schema: {
      example: [
        {
          id: 'uuid',
          userId: 'uuid',
          targetWeight: 70.0,
          targetCalories: 2000,
          startDate: '2025-12-21T00:00:00.000Z',
          endDate: '2026-03-21T00:00:00.000Z',
          status: 'IN_PROGRESS',
          isActive: true,
        },
        {
          id: 'uuid',
          userId: 'uuid',
          targetWeight: 75.0,
          targetCalories: 2200,
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T00:00:00.000Z',
          status: 'COMPLETED',
          isActive: false,
        },
      ],
    },
  } as ApiResponseOptions,

  goalDeactivated: {
    status: 200,
    description: 'Цель успешно деактивирована',
    schema: {
      example: {
        message: 'Цель успешно деактивирована',
      },
    },
  } as ApiResponseOptions,

  activityLevels: {
    status: 200,
    description: 'Список уровней активности',
    schema: {
      example: [
        {
          id: 'sedentary',
          name: 'Сидячий образ жизни',
          description: 'Минимальная физическая активность',
          coefficient: 1.2,
        },
        {
          id: 'light',
          name: 'Легкая активность (1-3 раза в неделю)',
          description: 'Легкие тренировки или прогулки',
          coefficient: 1.375,
        },
      ],
    },
  } as ApiResponseOptions,

  notFound: {
    status: 404,
    description: 'Ресурс не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'Запись веса не найдена',
        error: 'Not Found',
      },
    },
  } as ApiResponseOptions,

  badRequest: {
    status: 400,
    description: 'Неверный запрос',
    schema: {
      example: {
        statusCode: 400,
        message: ['Validation error message'],
        error: 'Bad Request',
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
