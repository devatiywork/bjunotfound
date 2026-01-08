import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const DishesSwaggerDocs = {
  create: {
    summary: 'Создать блюдо',
    description:
      'Создает новое блюдо с автоматическим расчетом КБЖУ из ингредиентов. Админы создают верифицированные блюда.',
  } as ApiOperationOptions,

  uploadPhoto: {
    summary: 'Загрузить фото блюда',
    description:
      'Загружает изображение блюда в Cloudinary и возвращает URL. Максимум 5MB, форматы: JPG, PNG, WebP.',
  } as ApiOperationOptions,

  findAll: {
    summary: 'Получить список блюд',
    description:
      'Возвращает список блюд с пагинацией и фильтрацией. Публичные блюда доступны всем, личные - только создателю.',
  } as ApiOperationOptions,

  getFavorites: {
    summary: 'Получить избранные блюда',
    description:
      'Возвращает список избранных блюд текущего пользователя, отсортированных по дате добавления.',
  } as ApiOperationOptions,

  findOne: {
    summary: 'Получить блюдо по ID',
    description:
      'Возвращает детальную информацию о блюде, включая ингредиенты, теги и расчетные КБЖУ.',
  } as ApiOperationOptions,

  update: {
    summary: 'Обновить блюдо',
    description:
      'Обновляет данные блюда. При изменении ингредиентов или порций автоматически пересчитывает КБЖУ. Доступно создателю или админу.',
  } as ApiOperationOptions,

  remove: {
    summary: 'Удалить блюдо',
    description:
      'Удаляет блюдо и все связанные данные (ингредиенты, теги). Доступно создателю или админу.',
  } as ApiOperationOptions,

  recalculate: {
    summary: 'Пересчитать КБЖУ блюда',
    description:
      'Пересчитывает КБЖУ блюда на основе текущих данных продуктов. Полезно, если обновилась информация о продуктах. Доступно создателю или админу.',
  } as ApiOperationOptions,

  addToFavorites: {
    summary: 'Добавить блюдо в избранное',
    description: 'Добавляет блюдо в список избранных текущего пользователя.',
  } as ApiOperationOptions,

  removeFromFavorites: {
    summary: 'Удалить блюдо из избранного',
    description: 'Удаляет блюдо из списка избранных текущего пользователя.',
  } as ApiOperationOptions,
};

export const DishesSwaggerResponses = {
  dishCreated: {
    status: 201,
    description: 'Блюдо успешно создано',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Куриная грудка с овощами',
        description: 'Полезное блюдо для ужина',
        photo: 'https://res.cloudinary.com/example/image.jpg',
        servings: 2,
        servingSize: 300,
        totalCalories: 520.5,
        totalProteins: 68.4,
        totalFats: 12.2,
        totalCarbs: 32.1,
        totalFiber: 8.5,
        totalSugar: 6.2,
        totalPrice: 250.5,
        totalWeight: 600,
        caloriesPerServing: 260.25,
        proteinsPerServing: 34.2,
        fatsPerServing: 6.1,
        carbsPerServing: 16.05,
        pricePerServing: 125.25,
        cookingTimeMinutes: 30,
        difficulty: 'MEDIUM',
        mealType: 'DINNER',
        cuisineType: 'RUSSIAN',
        dishCategory: 'MAIN_COURSE',
        userId: 'user-id',
        isPublic: true,
        isVerified: false,
        source: 'USER',
        createdAt: '2026-01-02T12:00:00.000Z',
        updatedAt: '2026-01-02T12:00:00.000Z',
        creator: {
          id: 'user-id',
          email: 'user@example.com',
        },
        ingredients: [
          {
            id: 'ingredient-id',
            amount: 300,
            unit: 'G',
            product: {
              id: 'product-id',
              name: 'Куриная грудка',
              calories: 165,
              proteins: 31,
              fats: 3.6,
              carbs: 0,
            },
          },
        ],
        tags: [
          {
            tag: {
              id: 'tag-id',
              name: 'Высокобелковое',
              category: 'DIETARY',
            },
          },
        ],
      },
    },
  } as ApiResponseOptions,

  photoUploaded: {
    status: 201,
    description: 'Фото успешно загружено',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/example/image/upload/v1234567890/products/abcd1234.jpg',
      },
    },
  } as ApiResponseOptions,

  dishesList: {
    status: 200,
    description: 'Список блюд успешно получен',
    schema: {
      example: {
        dishes: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Куриная грудка с овощами',
            description: 'Полезное блюдо для ужина',
            photo: 'https://res.cloudinary.com/example/image.jpg',
            caloriesPerServing: 260.25,
            proteinsPerServing: 34.2,
            fatsPerServing: 6.1,
            carbsPerServing: 16.05,
            pricePerServing: 125.25,
            servings: 2,
            cookingTimeMinutes: 30,
            difficulty: 'MEDIUM',
            mealType: 'DINNER',
            isPublic: true,
            isVerified: false,
            creator: {
              id: 'user-id',
              email: 'user@example.com',
            },
            ingredients: [
              {
                product: {
                  id: 'product-id',
                  name: 'Куриная грудка',
                  unit: 'G',
                },
              },
            ],
            tags: [
              {
                tag: {
                  id: 'tag-id',
                  name: 'Высокобелковое',
                  category: 'DIETARY',
                },
              },
            ],
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      },
    },
  } as ApiResponseOptions,

  dishFound: {
    status: 200,
    description: 'Блюдо успешно найдено',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Куриная грудка с овощами',
        description: 'Полезное блюдо для ужина',
        photo: 'https://res.cloudinary.com/example/image.jpg',
        servings: 2,
        servingSize: 300,
        totalCalories: 520.5,
        totalProteins: 68.4,
        totalFats: 12.2,
        totalCarbs: 32.1,
        caloriesPerServing: 260.25,
        proteinsPerServing: 34.2,
        fatsPerServing: 6.1,
        carbsPerServing: 16.05,
        pricePerServing: 125.25,
        cookingTimeMinutes: 30,
        difficulty: 'MEDIUM',
        creator: {
          id: 'user-id',
          email: 'user@example.com',
        },
        ingredients: [
          {
            id: 'ingredient-id',
            amount: 300,
            unit: 'G',
            product: {
              id: 'product-id',
              name: 'Куриная грудка',
              calories: 165,
              proteins: 31,
              fats: 3.6,
              carbs: 0,
            },
          },
        ],
        tags: [
          {
            tag: {
              id: 'tag-id',
              name: 'Высокобелковое',
              category: 'DIETARY',
            },
          },
        ],
      },
    },
  } as ApiResponseOptions,

  dishUpdated: {
    status: 200,
    description: 'Блюдо успешно обновлено',
  } as ApiResponseOptions,

  dishDeleted: {
    status: 200,
    description: 'Блюдо успешно удалено',
    schema: {
      example: {
        message: 'Блюдо успешно удалено',
      },
    },
  } as ApiResponseOptions,

  dishRecalculated: {
    status: 200,
    description: 'КБЖУ блюда успешно пересчитано',
  } as ApiResponseOptions,

  addedToFavorites: {
    status: 201,
    description: 'Блюдо добавлено в избранное',
    schema: {
      example: {
        message: 'Блюдо добавлено в избранное',
      },
    },
  } as ApiResponseOptions,

  removedFromFavorites: {
    status: 200,
    description: 'Блюдо удалено из избранного',
    schema: {
      example: {
        message: 'Блюдо удалено из избранного',
      },
    },
  } as ApiResponseOptions,

  favoritesList: {
    status: 200,
    description: 'Список избранных блюд успешно получен',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Куриная грудка с овощами',
          caloriesPerServing: 260.25,
          servings: 2,
          creator: {
            id: 'user-id',
            email: 'user@example.com',
          },
        },
      ],
    },
  } as ApiResponseOptions,

  badRequest: {
    status: 400,
    description: 'Неверные данные запроса',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Название должно содержать минимум 2 символа',
          'Количество порций должно быть от 1 до 100',
        ],
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
    description: 'Блюдо не найдено',
    schema: {
      example: {
        statusCode: 404,
        message: 'Блюдо не найдено',
        error: 'Not Found',
      },
    },
  } as ApiResponseOptions,
};
