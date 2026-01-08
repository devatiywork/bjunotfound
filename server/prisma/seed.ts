import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Начинаем заполнение БД начальными данными...');

  // Заполнение таблицы ролей
  const userRoles = [
    {
      id: 'user',
      name: 'Пользователь',
      description: 'Обычный пользователь с базовыми правами',
    },
    {
      id: 'admin',
      name: 'Администратор',
      description: 'Администратор с полными правами доступа',
    },
  ];

  for (const role of userRoles) {
    await prisma.userRole.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
    console.log(`✓ Роль "${role.name}" создана`);
  }

  // Заполнение таблицы уровней активности
  const activityLevels = [
    {
      id: 'sedentary',
      name: 'Сидячий образ жизни',
      description: 'Минимальная физическая активность, сидячая работа',
      coefficient: 1.2,
    },
    {
      id: 'light',
      name: 'Легкая активность (1-3 раза в неделю)',
      description: 'Легкие тренировки или прогулки 1-3 раза в неделю',
      coefficient: 1.375,
    },
    {
      id: 'moderate',
      name: 'Умеренная активность (3-5 раз в неделю)',
      description: 'Тренировки средней интенсивности 3-5 раз в неделю',
      coefficient: 1.55,
    },
    {
      id: 'active',
      name: 'Активный образ жизни (6-7 раз в неделю)',
      description: 'Интенсивные тренировки 6-7 раз в неделю',
      coefficient: 1.725,
    },
    {
      id: 'very_active',
      name: 'Очень активный (интенсивные тренировки)',
      description: 'Очень интенсивные тренировки, физическая работа',
      coefficient: 1.9,
    },
  ];

  for (const level of activityLevels) {
    await prisma.activityLevel.upsert({
      where: { id: level.id },
      update: {},
      create: level,
    });
    console.log(`✓ Уровень активности "${level.name}" создан`);
  }

  // Заполнение таблицы настроек калорий
  const calorieSettings = [
    // Границы безопасности
    {
      key: 'min_calories_female',
      value: 1200,
      category: 'safety_limits',
      label: 'Минимум калорий (женщины)',
      description: 'Минимально допустимое количество калорий в день для женщин',
    },
    {
      key: 'min_calories_male',
      value: 1500,
      category: 'safety_limits',
      label: 'Минимум калорий (мужчины)',
      description: 'Минимально допустимое количество калорий в день для мужчин',
    },
    {
      key: 'max_deficit',
      value: 1000,
      category: 'safety_limits',
      label: 'Максимальный дефицит калорий',
      description:
        'Максимально допустимый дефицит калорий в день для похудения',
    },
    {
      key: 'max_surplus',
      value: 500,
      category: 'safety_limits',
      label: 'Максимальный профицит калорий',
      description:
        'Максимально допустимый профицит калорий в день для набора веса',
    },
    // Варианты темпа достижения цели (похудение) - в кг/неделю
    {
      key: 'pace_very_fast',
      value: 1.0,
      category: 'pace_options',
      label: 'Очень быстрый темп',
      description:
        '1.0 кг/неделю для быстрого похудения (~1100 ккал/день дефицит)',
    },
    {
      key: 'pace_fast',
      value: 0.75,
      category: 'pace_options',
      label: 'Быстрый темп',
      description: '0.75 кг/неделю для похудения (~825 ккал/день дефицит)',
    },
    {
      key: 'pace_moderate',
      value: 0.5,
      category: 'pace_options',
      label: 'Средний темп (рекомендуется)',
      description:
        '0.5 кг/неделю для умеренного похудения (~550 ккал/день дефицит)',
    },
    {
      key: 'pace_comfortable',
      value: 0.3,
      category: 'pace_options',
      label: 'Комфортный темп',
      description:
        '0.3 кг/неделю для комфортного похудения (~330 ккал/день дефицит)',
    },
    // Варианты темпа для набора веса - в кг/неделю
    {
      key: 'pace_gain_fast',
      value: 0.5,
      category: 'pace_options',
      label: 'Быстрый набор веса',
      description: '0.5 кг/неделю для набора веса (~550 ккал/день профицит)',
    },
    {
      key: 'pace_gain_moderate',
      value: 0.3,
      category: 'pace_options',
      label: 'Средний набор веса (рекомендуется)',
      description:
        '0.3 кг/неделю для умеренного набора веса (~330 ккал/день профицит)',
    },
    {
      key: 'pace_gain_comfortable',
      value: 0.2,
      category: 'pace_options',
      label: 'Комфортный набор веса',
      description:
        '0.2 кг/неделю для медленного набора веса (~220 ккал/день профицит)',
    },
    // Научные константы
    {
      key: 'calories_per_kg_fat',
      value: 7700,
      category: 'scientific',
      label: 'Калорий на 1 кг жира',
      description: 'Энергетическая ценность 1 кг жировой ткани',
    },
  ];

  for (const setting of calorieSettings) {
    await prisma.calorieSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`✓ Настройка "${setting.label}" создана`);
  }

  // Заполнение таблицы категорий продуктов
  const categories = [
    {
      name: 'Мясо и птица',
      description: 'Говядина, свинина, курица, индейка и другое мясо',
    },
    {
      name: 'Рыба и морепродукты',
      description: 'Рыба, креветки, кальмары и другие морепродукты',
    },
    {
      name: 'Молочные продукты',
      description: 'Молоко, творог, сыр, йогурт, кефир',
    },
    { name: 'Яйца', description: 'Куриные, перепелиные и другие яйца' },
    { name: 'Овощи', description: 'Свежие и замороженные овощи' },
    {
      name: 'Фрукты и ягоды',
      description: 'Свежие и замороженные фрукты и ягоды',
    },
    {
      name: 'Крупы и злаки',
      description: 'Рис, гречка, овсянка, пшено и другие крупы',
    },
    { name: 'Хлеб и выпечка', description: 'Хлеб, булочки, печенье, торты' },
    { name: 'Макароны', description: 'Макаронные изделия всех видов' },
    { name: 'Бобовые', description: 'Фасоль, горох, чечевица, нут' },
    {
      name: 'Орехи и семена',
      description: 'Грецкие орехи, миндаль, семечки и другие',
    },
    {
      name: 'Масла и жиры',
      description: 'Растительные и животные масла, сливочное масло',
    },
    {
      name: 'Сладости и десерты',
      description: 'Шоколад, конфеты, мороженое, десерты',
    },
    {
      name: 'Напитки',
      description: 'Соки, чай, кофе, газировка и другие напитки',
    },
    {
      name: 'Готовые блюда',
      description: 'Полуфабрикаты и готовые к употреблению блюда',
    },
    {
      name: 'Соусы и приправы',
      description: 'Кетчуп, майонез, специи, приправы',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`✓ Категория "${category.name}" создана`);
  }

  // Заполнение таблицы тегов
  const tags = [
    'Высокобелковое',
    'Низкоуглеводное',
    'Низкокалорийное',
    'Вегетарианское',
    'Веганское',
    'Безглютеновое',
    'Безлактозное',
    'Органическое',
    'Диетическое',
    'Для набора массы',
    'Для похудения',
    'Богатое клетчаткой',
    'Источник омега-3',
    'Источник кальция',
    'Источник железа',
    'Антиоксиданты',
    'Быстрое приготовление',
    'Детское питание',
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
    console.log(`✓ Тег "${tagName}" создан`);
  }

  // Заполнение таблицы тегов блюд
  const dishTags: Array<{
    name: string;
    category:
      | 'DIETARY'
      | 'MEAL_TIME'
      | 'COOKING_TIME'
      | 'DIFFICULTY'
      | 'CUISINE'
      | 'OCCASION'
      | 'SPECIAL';
  }> = [
    // Dietary (8)
    { name: 'Вегетарианское', category: 'DIETARY' },
    { name: 'Веганское', category: 'DIETARY' },
    { name: 'Безглютеновое', category: 'DIETARY' },
    { name: 'Безлактозное', category: 'DIETARY' },
    { name: 'Кето', category: 'DIETARY' },
    { name: 'Низкоуглеводное', category: 'DIETARY' },
    { name: 'Высокобелковое', category: 'DIETARY' },
    { name: 'Низкокалорийное', category: 'DIETARY' },
    // Meal Time (5)
    { name: 'Завтрак', category: 'MEAL_TIME' },
    { name: 'Обед', category: 'MEAL_TIME' },
    { name: 'Ужин', category: 'MEAL_TIME' },
    { name: 'Перекус', category: 'MEAL_TIME' },
    { name: 'Поздний ужин', category: 'MEAL_TIME' },
    // Cooking Time (3)
    { name: 'Быстрое (до 15 мин)', category: 'COOKING_TIME' },
    { name: 'Среднее (15-45 мин)', category: 'COOKING_TIME' },
    { name: 'Долгое (45+ мин)', category: 'COOKING_TIME' },
    // Difficulty (3)
    { name: 'Простое', category: 'DIFFICULTY' },
    { name: 'Средней сложности', category: 'DIFFICULTY' },
    { name: 'Сложное', category: 'DIFFICULTY' },
    // Cuisine (10)
    { name: 'Русская кухня', category: 'CUISINE' },
    { name: 'Итальянская кухня', category: 'CUISINE' },
    { name: 'Азиатская кухня', category: 'CUISINE' },
    { name: 'Мексиканская кухня', category: 'CUISINE' },
    { name: 'Французская кухня', category: 'CUISINE' },
    { name: 'Японская кухня', category: 'CUISINE' },
    { name: 'Американская кухня', category: 'CUISINE' },
    { name: 'Индийская кухня', category: 'CUISINE' },
    { name: 'Средиземноморская кухня', category: 'CUISINE' },
    { name: 'Греческая кухня', category: 'CUISINE' },
    // Occasion (5)
    { name: 'На каждый день', category: 'OCCASION' },
    { name: 'Праздничное', category: 'OCCASION' },
    { name: 'Для гостей', category: 'OCCASION' },
    { name: 'Детское меню', category: 'OCCASION' },
    { name: 'Романтический ужин', category: 'OCCASION' },
    // Special (6)
    { name: 'Подходит для заморозки', category: 'SPECIAL' },
    { name: 'Можно приготовить заранее', category: 'SPECIAL' },
    { name: 'Одна сковорода', category: 'SPECIAL' },
    { name: 'Без готовки', category: 'SPECIAL' },
    { name: 'Бюджетное', category: 'SPECIAL' },
    { name: 'Подходит для meal prep', category: 'SPECIAL' },
  ];

  for (const dishTag of dishTags) {
    await prisma.dishTag.upsert({
      where: { name: dishTag.name },
      update: {},
      create: dishTag,
    });
    console.log(`✓ Тег блюда "${dishTag.name}" создан`);
  }

  console.log('\nЗаполнение БД завершено!');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
