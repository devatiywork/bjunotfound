import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const MealTypesSwaggerDocs = {
  create: {
    summary: 'Создать пользовательский тип приема пищи',
    description:
      'Создает новый пользовательский тип приема пищи. Системные типы (Завтрак, Обед, Ужин, Перекус) создавать нельзя - они уже существуют.',
  } as ApiOperationOptions,

  getAll: {
    summary: 'Получить все типы приемов пищи',
    description:
      'Возвращает все активные типы приемов пищи пользователя: системные (Завтрак, Обед, Ужин, Перекус) + пользовательские типы. Типы отсортированы по sortOrder.',
  } as ApiOperationOptions,

  update: {
    summary: 'Обновить пользовательский тип приема пищи',
    description:
      'Обновляет название, порядок или статус активности пользовательского типа. Системные типы обновлять нельзя.',
  } as ApiOperationOptions,

  archive: {
    summary: 'Архивировать пользовательский тип приема пищи',
    description:
      'Архивирует (мягкое удаление) пользовательский тип приема пищи. Системные типы архивировать нельзя. Архивированные типы не отображаются в списке.',
  } as ApiOperationOptions,

  reorder: {
    summary: 'Изменить порядок отображения типа',
    description:
      'Изменяет порядок отображения пользовательского типа приема пищи в списках. Системные типы переупорядочивать нельзя.',
  } as ApiOperationOptions,
};

export const MealTypesSwaggerResponses = {
  mealTypeCreated: {
    status: 201,
    description: 'Тип приема пищи успешно создан',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        code: null,
        name: 'Второй завтрак',
        sortOrder: 5,
        isActive: true,
        isArchived: false,
        deletedAt: null,
        deletedBy: null,
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T10:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  mealTypesList: {
    status: 200,
    description: 'Список типов приемов пищи успешно получен',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: null,
          code: 'BREAKFAST',
          name: 'Завтрак',
          sortOrder: 1,
          isActive: true,
          createdAt: '2026-01-15T10:00:00.000Z',
          updatedAt: '2026-01-15T10:00:00.000Z',
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          userId: null,
          code: 'LUNCH',
          name: 'Обед',
          sortOrder: 2,
          isActive: true,
          createdAt: '2026-01-15T10:00:00.000Z',
          updatedAt: '2026-01-15T10:00:00.000Z',
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          userId: '123e4567-e89b-12d3-a456-426614174003',
          code: null,
          name: 'Второй завтрак',
          sortOrder: 5,
          isActive: true,
          createdAt: '2026-01-15T10:00:00.000Z',
          updatedAt: '2026-01-15T10:00:00.000Z',
        },
      ],
    },
  } as ApiResponseOptions,

  mealTypeUpdated: {
    status: 200,
    description: 'Тип приема пищи успешно обновлен',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        code: null,
        name: 'Второй завтрак (обновлено)',
        sortOrder: 6,
        isActive: true,
        isArchived: false,
        deletedAt: null,
        deletedBy: null,
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T10:30:00.000Z',
      },
    },
  } as ApiResponseOptions,

  mealTypeArchived: {
    status: 200,
    description: 'Тип приема пищи успешно архивирован',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        code: null,
        name: 'Второй завтрак',
        sortOrder: 5,
        isActive: true,
        isArchived: true,
        deletedAt: '2026-01-15T11:00:00.000Z',
        deletedBy: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T11:00:00.000Z',
      },
    },
  } as ApiResponseOptions,

  mealTypeNotFound: {
    status: 404,
    description: 'Тип приема пищи не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'Тип приема пищи не найден',
        error: 'Not Found',
      },
    },
  } as ApiResponseOptions,

  forbidden: {
    status: 403,
    description: 'Нет доступа (системный тип или чужой тип)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Нельзя редактировать системные типы приемов пищи',
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
        message: ['name should not be empty', 'sortOrder must be a number'],
        error: 'Bad Request',
      },
    },
  } as ApiResponseOptions,
};
