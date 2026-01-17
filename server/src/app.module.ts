import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ActivitiesModule } from './activities/activities.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { DishesModule } from './dishes/dishes.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { GoalsModule } from './goals/goals.module';
import { MealEventsModule } from './meal-events/meal-events.module';
import { MealStatisticsModule } from './meal-statistics/meal-statistics.module';
import { MealTypesModule } from './meal-types/meal-types.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsUserModule } from './products-user/products-user.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    PrismaModule,
    FileUploadModule,
    AuthModule,
    // Rate Limiting: настраивается через .env
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
      },
    ]),
    UsersModule,
    GoalsModule,
    AdminModule,
    CategoriesModule,
    BrandsModule,
    ProductsUserModule,
    DishesModule,
    MealTypesModule,
    MealEventsModule,
    MealStatisticsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ActivitiesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
