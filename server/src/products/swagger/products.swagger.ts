import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

/**
 * Описания операций для Swagger документации Products модуля
 */
export const ProductsSwaggerDocs = {
  create: {
    summary: 'Создать продукт',
    description:
      'Создает новый продукт. Администраторы создают верифицированные продукты (source=ADMIN). Обычные пользователи могут создавать свои продукты (source=USER, isVerified=false).',
  } as ApiOperationOptions,

  findAll: {
    summary: 'Получить список продуктов',
    description:
      'Возвращает список продуктов с пагинацией, поиском и фильтрами. Показываются публичные продукты и личные продукты текущего пользователя.',
  } as ApiOperationOptions,

  findOne: {
    summary: 'Получить продукт по ID',
    description:
      'Возвращает детальную информацию о продукте. Доступ к личным продуктам имеет только их создатель.',
  } as ApiOperationOptions,

  findByBarcode: {
    summary: 'Найти продукт по штрих-коду',
    description:
      'Поиск продукта по штрих-коду (EAN-13/UPC). Используется для сканирования продуктов через камеру.',
  } as ApiOperationOptions,

  update: {
    summary: 'Обновить продукт',
    description:
      'Обновление данных продукта. Администраторы могут редактировать любые продукты. Обычные пользователи - только свои.',
  } as ApiOperationOptions,

  remove: {
    summary: 'Удалить продукт',
    description:
      'Удаление продукта. Администраторы могут удалять любые продукты. Обычные пользователи - только свои.',
  } as ApiOperationOptions,

  getStats: {
    summary: 'Получить статистику продуктов',
    description:
      'Возвращает статистику по продуктам: общее количество, распределение по источникам, топ категорий. Только для администраторов.',
  } as ApiOperationOptions,
};

/**
 * Примеры ответов для Swagger документации
 */
export const ProductsSwaggerResponses = {
  product: {
    status: 200,
    description: 'Продукт успешно получен',
    schema: {
      example: {
        id: 'uuid',
        name: 'Куриная грудка',
        description: 'Филе куриной грудки без кожи',
        calories: 165,
        proteins: 31,
        fats: 3.6,
        carbs: 0,
        fiber: null,
        sugar: null,
        saturatedFat: 1.2,
        sodium: 50,
        servingSize: 100,
        unit: 'G',
        brand: 'Мираторг',
        barcode: '4607065597597',
        photo: 'https://example.com/photo.jpg',
        price: 299.99,
        isVerified: true,
        source: 'ADMIN',
        userId: null,
        isPublic: true,
        categoryId: 'uuid',
        createdAt: '2025-12-21T00:00:00.000Z',
        updatedAt: '2025-12-21T00:00:00.000Z',
        category: {
          id: 'uuid',
          name: 'Мясо',
          description: 'Мясные продукты',
        },
        tags: [
          {
            tag: {
              id: 'uuid',
              name: 'Белковое',
            },
          },
          {
            tag: {
              id: 'uuid',
              name: 'Низкоуглеводное',
            },
          },
        ],
        creator: null,
      },
    },
  } as ApiResponseOptions,

  productList: {
    status: 200,
    description: 'Список продуктов успешно получен',
    schema: {
      example: {
        products: [
          {
            id: 'uuid',
            name: 'Куриная грудка',
            calories: 165,
            proteins: 31,
            fats: 3.6,
            carbs: 0,
            brand: 'Мираторг',
            price: 299.99,
            category: { id: 'uuid', name: 'Мясо' },
            tags: [{ tag: { id: 'uuid', name: 'Белковое' } }],
          },
        ],
        pagination: {
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
        },
      },
    },
  } as ApiResponseOptions,

  productCreated: {
    status: 201,
    description: 'Продукт успешно создан',
    schema: {
      example: {
        id: 'uuid',
        name: 'Куриная грудка',
        calories: 165,
        proteins: 31,
        fats: 3.6,
        carbs: 0,
        isVerified: false,
        source: 'USER',
        userId: 'uuid',
        category: { id: 'uuid', name: 'Мясо' },
      },
    },
  } as ApiResponseOptions,

  productDeleted: {
    status: 200,
    description: 'Продукт успешно удален',
    schema: {
      example: {
        message: 'Продукт успешно удален',
      },
    },
  } as ApiResponseOptions,

  stats: {
    status: 200,
    description: 'Статистика продуктов',
    schema: {
      example: {
        total: 150,
        bySource: [
          { source: 'ADMIN', _count: 100 },
          { source: 'USER', _count: 45 },
          { source: 'API', _count: 5 },
        ],
        topCategories: [
          { categoryId: 'uuid', _count: 50 },
          { categoryId: 'uuid', _count: 30 },
        ],
        recentlyAdded: 12,
      },
    },
  } as ApiResponseOptions,

  badRequest: {
    status: 400,
    description: 'Неверные данные запроса',
    schema: {
      example: {
        statusCode: 400,
        message: ['calories must be a number', 'name is required'],
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

  forbidden: {
    status: 403,
    description: 'Недостаточно прав',
    schema: {
      example: {
        statusCode: 403,
        message: 'Недостаточно прав для редактирования',
        error: 'Forbidden',
      },
    },
  } as ApiResponseOptions,

  notFound: {
    status: 404,
    description: 'Продукт не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'Продукт не найден',
        error: 'Not Found',
      },
    },
  } as ApiResponseOptions,
};
