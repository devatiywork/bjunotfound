import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { calculateActivityCalories } from '../utils/activity-calories';
import { AddActivityDto } from './dto/add-activity.dto';
import { FilterActivitiesDto } from './dto/filter-activities.dto';
import { StatsPeriod } from './dto/get-stats.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async addActivity(userId: string, dto: AddActivityDto) {
    // Получаем профиль пользователя с последним весом
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        weights: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const currentWeight = user.weights[0]?.weight;
    if (!currentWeight) {
      throw new NotFoundException('Добавьте вес в профиль для расчета калорий');
    }

    // Определяем дату с учетом timezone
    const targetDate = dto.date
      ? DateTime.fromISO(dto.date, { zone: user.timezone })
      : DateTime.now().setZone(user.timezone);

    const dateOnly = targetDate.toISODate();
    if (!dateOnly) {
      throw new BadRequestException('Некорректная дата');
    }

    const dateObj = new Date(dateOnly);

    // Рассчитываем калории для этой активности
    const activityType = dto.activityType || 'WALKING';
    const burnedCalories = calculateActivityCalories(
      dto.steps,
      currentWeight,
      activityType,
    );

    // Ищем или создаем ActivityLog за этот день
    let activityLog = await this.prisma.activityLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      include: {
        activities: true,
      },
    });

    if (!activityLog) {
      // Создаем новый ActivityLog
      activityLog = await this.prisma.activityLog.create({
        data: {
          userId,
          date: dateObj,
          recordedAt: new Date(),
          steps: 0,
          burnedCalories: 0,
        },
        include: {
          activities: true,
        },
      });
    }

    // Создаем детальную запись Activity
    await this.prisma.activity.create({
      data: {
        activityLogId: activityLog.id,
        type: activityType,
        steps: dto.steps,
        burnedCalories,
        performedAt: new Date(),
      },
    });

    // Пересчитываем суммы в ActivityLog
    const allActivities = await this.prisma.activity.findMany({
      where: { activityLogId: activityLog.id },
    });

    const totalSteps = allActivities.reduce((sum, a) => sum + a.steps, 0);
    const totalCalories = allActivities.reduce(
      (sum, a) => sum + a.burnedCalories,
      0,
    );

    // Обновляем ActivityLog
    const updatedLog = await this.prisma.activityLog.update({
      where: { id: activityLog.id },
      data: {
        steps: totalSteps,
        burnedCalories: totalCalories,
      },
      include: {
        activities: {
          orderBy: { performedAt: 'asc' },
        },
      },
    });

    return updatedLog;
  }

  async getActivities(userId: string, dto: FilterActivitiesDto) {
    const { startDate, endDate, page = 1, limit = 30 } = dto;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          activities: {
            orderBy: { performedAt: 'asc' },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getToday(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Определяем сегодняшнюю дату в timezone пользователя
    const now = DateTime.now().setZone(user.timezone);
    const dateOnly = now.toISODate();

    if (!dateOnly) {
      throw new BadRequestException('Ошибка определения даты');
    }

    return this.getByDate(userId, dateOnly);
  }

  async getByDate(userId: string, date: string) {
    const dateObj = new Date(date);

    const activityLog = await this.prisma.activityLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      include: {
        activities: {
          orderBy: { performedAt: 'asc' },
        },
      },
    });

    // Получаем активную цель пользователя
    const goal = await this.prisma.goal.findFirst({
      where: {
        userId,
        isActive: true,
        status: 'IN_PROGRESS',
      },
    });

    if (!activityLog) {
      // Возвращаем пустую активность с целью
      return {
        id: null,
        date,
        steps: 0,
        burnedCalories: 0,
        consumedCalories: null,
        activities: [],
        goal: goal
          ? {
              targetSteps: goal.targetSteps,
              targetBurnedCalories: goal.targetBurnedCalories,
              progressSteps: 0,
              progressCalories: 0,
            }
          : null,
      };
    }

    // Рассчитываем прогресс по целям
    const goalProgress = goal
      ? {
          targetSteps: goal.targetSteps,
          targetBurnedCalories: goal.targetBurnedCalories,
          progressSteps: goal.targetSteps
            ? (activityLog.steps / goal.targetSteps) * 100
            : 0,
          progressCalories: goal.targetBurnedCalories
            ? (activityLog.burnedCalories / goal.targetBurnedCalories) * 100
            : 0,
        }
      : null;

    return {
      ...activityLog,
      goal: goalProgress,
    };
  }

  async deleteActivity(userId: string, activityId: string) {
    // Находим Activity и проверяем права доступа
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        activityLog: true,
      },
    });

    if (!activity) {
      throw new NotFoundException('Активность не найдена');
    }

    if (activity.activityLog.userId !== userId) {
      throw new NotFoundException('Активность не найдена');
    }

    // Удаляем активность
    await this.prisma.activity.delete({
      where: { id: activityId },
    });

    // Получаем оставшиеся активности для этого дня
    const remainingActivities = await this.prisma.activity.findMany({
      where: { activityLogId: activity.activityLogId },
    });

    if (remainingActivities.length === 0) {
      // Если активностей не осталось - удаляем весь ActivityLog
      await this.prisma.activityLog.delete({
        where: { id: activity.activityLogId },
      });

      return {
        message: 'Activity deleted successfully',
        activityLog: null,
      };
    }

    // Пересчитываем суммы
    const totalSteps = remainingActivities.reduce((sum, a) => sum + a.steps, 0);
    const totalCalories = remainingActivities.reduce(
      (sum, a) => sum + a.burnedCalories,
      0,
    );

    // Обновляем ActivityLog
    const updatedLog = await this.prisma.activityLog.update({
      where: { id: activity.activityLogId },
      data: {
        steps: totalSteps,
        burnedCalories: totalCalories,
      },
      include: {
        activities: {
          orderBy: { performedAt: 'asc' },
        },
      },
    });

    return {
      message: 'Activity deleted successfully',
      activityLog: updatedLog,
    };
  }

  async getStats(userId: string, period: StatsPeriod) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Определяем диапазон дат
    const now = DateTime.now().setZone(user.timezone);
    let daysCount: number;

    switch (period) {
      case 'week':
        daysCount = 7;
        break;
      case 'month':
        daysCount = 30;
        break;
      case 'year':
        daysCount = 365;
        break;
      default:
        daysCount = 7;
    }

    const endDate = now.toISODate();
    const startDate = now.minus({ days: daysCount - 1 }).toISODate();

    if (!startDate || !endDate) {
      throw new BadRequestException('Ошибка определения периода');
    }

    // Получаем все активности за период
    const activities = await this.prisma.activityLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'desc' },
    });

    // Рассчитываем статистику
    const totalSteps = activities.reduce((sum, a) => sum + a.steps, 0);
    const totalBurnedCalories = activities.reduce(
      (sum, a) => sum + a.burnedCalories,
      0,
    );
    const activeDays = activities.filter((a) => a.steps > 0).length;

    const maxActivity = activities.reduce(
      (max, a) => (a.steps > max.steps ? a : max),
      activities[0] || { steps: 0, date: new Date() },
    );

    const minActivity = activities.reduce(
      (min, a) => (a.steps < min.steps ? a : min),
      activities[0] || { steps: 0, date: new Date() },
    );

    return {
      period,
      startDate,
      endDate,
      stats: {
        totalDays: daysCount,
        activeDays,
        totalSteps,
        totalBurnedCalories: Math.round(totalBurnedCalories * 100) / 100,
        avgSteps: Math.round((totalSteps / daysCount) * 100) / 100,
        avgStepsActive:
          activeDays > 0
            ? Math.round((totalSteps / activeDays) * 100) / 100
            : 0,
        avgBurnedCalories:
          Math.round((totalBurnedCalories / daysCount) * 100) / 100,
        maxSteps: maxActivity.steps,
        maxStepsDate: DateTime.fromJSDate(maxActivity.date).toISODate(),
        minSteps: minActivity.steps,
        minStepsDate: DateTime.fromJSDate(minActivity.date).toISODate(),
      },
      dailyData: activities.map((a) => ({
        date: DateTime.fromJSDate(a.date).toISODate(),
        steps: a.steps,
        burnedCalories: Math.round(a.burnedCalories * 100) / 100,
      })),
    };
  }
}
