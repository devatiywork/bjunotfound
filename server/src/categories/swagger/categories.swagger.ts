import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const CategoriesSwaggerDocs = {
  list: {
    summary: 'Получить список категорий',
    description:
      'Возвращает список всех категорий с фильтрацией. Обычные пользователи видят только активные категории, админы - все.',
  } as ApiOperationOptions,

  tree: {
    summary: 'Получить дерево категорий',
    description:
      'Возвращает иерархическую структуру всех категорий (корневые → дочерние → вложенные).',
  } as ApiOperationOptions,

  findById: {
    summary: 'Получить категорию по ID',
    description:
      'Возвращает детальную информацию о категории с родителем, детьми и подсчётом продуктов.',
  } as ApiOperationOptions,

  findBySlug: {
    summary: 'Получить категорию по slug',
    description: 'Возвращает категорию по slug (SEO-friendly URL).',
  } as ApiOperationOptions,

  create: {
    summary: 'Создать категорию',
    description:
      'Создаёт новую категорию. Slug генерируется автоматически из названия, если не указан.',
  } as ApiOperationOptions,

  update: {
    summary: 'Обновить категорию',
    description:
      'Обновляет существующую категорию. Проверяет циклические зависимости при смене родителя.',
  } as ApiOperationOptions,

  delete: {
    summary: 'Удалить категорию',
    description:
      'Удаляет категорию. Нельзя удалить категорию с подкатегориями или продуктами.',
  } as ApiOperationOptions,

  uploadPhoto: {
    summary: 'Загрузить фото категории',
    description:
      'Загружает изображение в Cloudinary и добавляет URL в массив photos категории.',
  } as ApiOperationOptions,

  deletePhoto: {
    summary: 'Удалить фото категории',
    description: 'Удаляет фотографию из Cloudinary и массива photos категории.',
  } as ApiOperationOptions,
};

export const CategoriesSwaggerResponses = {
  list: {
    status: 200,
    description: 'Список категорий успешно получен',
    schema: {
      example: {
        categories: [
          {
            id: 'uuid',
            parentId: null,
            name: 'Молочные продукты',
            slug: 'dairy-products',
            photos: ['https://cloudinary.com/cat1.jpg'],
            isActive: true,
            createdAt: '2026-01-10T10:00:00Z',
            updatedAt: '2026-01-10T10:00:00Z',
            _count: {
              children: 5,
              productsGlobal: 120,
              productsUser: 45,
            },
          },
        ],
        total: 15,
      },
    },
  } as ApiResponseOptions,

  tree: {
    status: 200,
    description: 'Дерево категорий успешно получено',
    schema: {
      example: {
        tree: [
          {
            id: 'uuid',
            name: 'Молочные продукты',
            slug: 'dairy-products',
            photos: ['url'],
            isActive: true,
            createdAt: '2026-01-10T10:00:00Z',
            updatedAt: '2026-01-10T10:00:00Z',
            children: [
              {
                id: 'uuid2',
                name: 'Йогурты',
                slug: 'yogurt',
                photos: [],
                isActive: true,
                createdAt: '2026-01-10T10:00:00Z',
                updatedAt: '2026-01-10T10:00:00Z',
                children: [],
              },
            ],
          },
        ],
      },
    },
  } as ApiResponseOptions,

  category: {
    status: 200,
    description: 'Категория успешно получена',
    schema: {
      example: {
        id: 'uuid',
        parentId: 'parent-uuid',
        name: 'Йогурты',
        slug: 'yogurt',
        photos: ['url1', 'url2'],
        isActive: true,
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z',
        parent: {
          id: 'parent-uuid',
          name: 'Молочные продукты',
          slug: 'dairy-products',
        },
        children: [
          {
            id: 'child-uuid',
            name: 'Греческий йогурт',
            slug: 'greek-yogurt',
            photos: [],
            isActive: true,
          },
        ],
        _count: {
          productsGlobal: 45,
          productsUser: 12,
        },
      },
    },
  } as ApiResponseOptions,

  created: {
    status: 201,
    description: 'Категория успешно создана',
    schema: {
      example: {
        id: 'new-uuid',
        parentId: null,
        name: 'Молочные продукты',
        slug: 'molochnye-produkty',
        photos: ['https://cloudinary.com/dairy.jpg'],
        isActive: true,
        createdAt: '2026-01-11T12:00:00Z',
        updatedAt: '2026-01-11T12:00:00Z',
      },
    },
  } as ApiResponseOptions,

  deleted: {
    status: 200,
    description: 'Категория успешно удалена',
    schema: {
      example: {
        message: 'Категория успешно удалена',
        deletedId: 'uuid',
      },
    },
  } as ApiResponseOptions,

  photoUploaded: {
    status: 201,
    description: 'Фото успешно загружено',
    schema: {
      example: {
        message: 'Фото успешно загружено',
        photoUrl: 'https://cloudinary.com/categories/photo123.jpg',
        category: {
          id: 'uuid',
          photos: ['https://cloudinary.com/categories/photo123.jpg'],
        },
      },
    },
  } as ApiResponseOptions,

  photoDeleted: {
    status: 200,
    description: 'Фото успешно удалено',
    schema: {
      example: {
        message: 'Фото успешно удалено',
        category: {
          id: 'uuid',
          photos: [],
        },
      },
    },
  } as ApiResponseOptions,

  badRequest: {
    status: 400,
    description: 'Неверные данные запроса',
    schema: {
      example: {
        statusCode: 400,
        message: 'Slug "dairy" уже занят',
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
    description: 'Недостаточно прав (требуется роль admin)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  } as ApiResponseOptions,

  notFound: {
    status: 404,
    description: 'Категория не найдена',
    schema: {
      example: {
        statusCode: 404,
        message: 'Категория с ID "uuid" не найдена',
      },
    },
  } as ApiResponseOptions,
};
