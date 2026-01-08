import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const ActivitiesSwaggerDocs = {
  addActivity: {
    summary: 'Добавить активность',
    description:
      'Добавляет новую запись активности (шаги) за сегодня или указанную дату. Автоматически рассчитывает сожженные калории на основе типа активности и веса пользователя.',
  } as ApiOperationOptions,

  getActivities: {
    summary: 'Получить активность за период',
    description:
      'Возвращает список активностей за указанный период с пагинацией. Каждая запись включает детальный список активностей за день.',
  } as ApiOperationOptions,

  getToday: {
    summary: 'Получить активность за сегодня',
    description:
      'Возвращает активность за сегодняшний день (определяется по timezone пользователя) с прогрессом по целям.',
  } as ApiOperationOptions,

  getByDate: {
    summary: 'Получить активность за дату',
    description:
      'Возвращает активность за конкретную дату с прогрессом по целям (targetSteps, targetBurnedCalories).',
  } as ApiOperationOptions,

  deleteActivity: {
    summary: 'Удалить активность',
    description:
      'Удаляет конкретную запись активности (Activity). Автоматически пересчитывает суммы в ActivityLog или удаляет весь лог, если не осталось активностей.',
  } as ApiOperationOptions,

  getStats: {
    summary: 'Получить статистику',
    description:
      'Возвращает агрегированную статистику за период (неделя/месяц/год): общее количество шагов, сожженные калории, средние значения, максимумы и минимумы.',
  } as ApiOperationOptions,
};

export const ActivitiesSwaggerResponses = {
  // POST /activities
  activityCreated: {
    status: 200,
    description: 'Активность успешно добавлена',
    schema: {
      example: {
        id: 'activity-log-uuid',
        date: '2026-01-03',
        recordedAt: '2026-01-03T15:30:00Z',
        steps: 15000,
        burnedCalories: 600.0,
        consumedCalories: null,
        activities: [
          {
            id: 'activity-1-uuid',
            type: 'WALKING',
            steps: 10000,
            burnedCalories: 400.0,
            durationMinutes: null,
            notes: null,
            performedAt: '2026-01-03T08:00:00Z',
            createdAt: '2026-01-03T08:00:00Z',
          },
          {
            id: 'activity-2-uuid',
            type: 'RUNNING',
            steps: 5000,
            burnedCalories: 200.0,
            durationMinutes: null,
            notes: null,
            performedAt: '2026-01-03T15:30:00Z',
            createdAt: '2026-01-03T15:30:00Z',
          },
        ],
        createdAt: '2026-01-03T08:00:00Z',
        updatedAt: '2026-01-03T15:30:00Z',
      },
    },
  } as ApiResponseOptions,

  // GET /activities
  activitiesList: {
    status: 200,
    description: 'Список активностей успешно получен',
    schema: {
      example: {
        activities: [
          {
            id: 'log-1-uuid',
            date: '2026-01-03',
            recordedAt: '2026-01-03T08:00:00Z',
            steps: 12000,
            burnedCalories: 480.0,
            consumedCalories: null,
            activities: [
              {
                id: 'act-1-uuid',
                type: 'WALKING',
                steps: 7000,
                burnedCalories: 280.0,
                performedAt: '2026-01-03T08:00:00Z',
              },
              {
                id: 'act-2-uuid',
                type: 'RUNNING',
                steps: 5000,
                burnedCalories: 200.0,
                performedAt: '2026-01-03T15:30:00Z',
              },
            ],
            createdAt: '2026-01-03T08:00:00Z',
            updatedAt: '2026-01-03T15:30:00Z',
          },
        ],
        pagination: {
          total: 45,
          page: 1,
          limit: 30,
          totalPages: 2,
        },
      },
    },
  } as ApiResponseOptions,

  // GET /activities/today
  todayActivity: {
    status: 200,
    description: 'Активность за сегодня успешно получена',
    schema: {
      example: {
        id: 'log-uuid',
        date: '2026-01-03',
        recordedAt: '2026-01-03T08:00:00Z',
        steps: 7250,
        burnedCalories: 290.0,
        consumedCalories: null,
        activities: [
          {
            id: 'act-uuid',
            type: 'WALKING',
            steps: 7250,
            burnedCalories: 290.0,
            durationMinutes: null,
            notes: null,
            performedAt: '2026-01-03T08:00:00Z',
            createdAt: '2026-01-03T08:00:00Z',
          },
        ],
        goal: {
          targetSteps: 10000,
          targetBurnedCalories: 400.0,
          progressSteps: 72.5,
          progressCalories: 72.5,
        },
        createdAt: '2026-01-03T08:00:00Z',
        updatedAt: '2026-01-03T08:00:00Z',
      },
    },
  } as ApiResponseOptions,

  // GET /activities/today (no activity)
  todayActivityEmpty: {
    status: 200,
    description: 'Нет активности за сегодня',
    schema: {
      example: {
        id: null,
        date: '2026-01-03',
        steps: 0,
        burnedCalories: 0,
        consumedCalories: null,
        activities: [],
        goal: {
          targetSteps: 10000,
          targetBurnedCalories: 400.0,
          progressSteps: 0,
          progressCalories: 0,
        },
      },
    },
  } as ApiResponseOptions,

  // DELETE /activities/:activityId
  activityDeleted: {
    status: 200,
    description: 'Активность успешно удалена',
    schema: {
      example: {
        message: 'Activity deleted successfully',
        activityLog: {
          id: 'log-uuid',
          date: '2026-01-03',
          steps: 7000,
          burnedCalories: 280.0,
          activities: [
            {
              id: 'remaining-activity-uuid',
              type: 'WALKING',
              steps: 7000,
              burnedCalories: 280.0,
              performedAt: '2026-01-03T08:00:00Z',
            },
          ],
        },
      },
    },
  } as ApiResponseOptions,

  // GET /activities/stats
  stats: {
    status: 200,
    description: 'Статистика успешно получена',
    schema: {
      example: {
        period: 'week',
        startDate: '2025-12-28',
        endDate: '2026-01-03',
        stats: {
          totalDays: 7,
          activeDays: 5,
          totalSteps: 68500,
          totalBurnedCalories: 2740.0,
          avgSteps: 9785.71,
          avgStepsActive: 13700.0,
          avgBurnedCalories: 391.43,
          maxSteps: 15000,
          maxStepsDate: '2026-01-02',
          minSteps: 0,
          minStepsDate: '2025-12-30',
        },
        dailyData: [
          {
            date: '2026-01-03',
            steps: 7250,
            burnedCalories: 290.0,
          },
          {
            date: '2026-01-02',
            steps: 15000,
            burnedCalories: 600.0,
          },
          {
            date: '2026-01-01',
            steps: 12500,
            burnedCalories: 500.0,
          },
        ],
      },
    },
  } as ApiResponseOptions,

  // Common errors
  badRequest: {
    status: 400,
    description: 'Невалидные данные',
    schema: {
      example: {
        statusCode: 400,
        message: ['steps must be between 1 and 100000'],
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

  notFound: {
    status: 404,
    description: 'Запись не найдена',
    schema: {
      example: {
        statusCode: 404,
        message: 'Activity not found',
      },
    },
  } as ApiResponseOptions,

  noWeight: {
    status: 404,
    description: 'Нет записей веса для расчета калорий',
    schema: {
      example: {
        statusCode: 404,
        message: 'Добавьте вес в профиль для расчета калорий',
      },
    },
  } as ApiResponseOptions,
};
