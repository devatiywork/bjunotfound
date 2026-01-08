import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { GoalsModule } from './goals/goals.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { DishesModule } from './dishes/dishes.module';
import { DishTagsModule } from './dish-tags/dish-tags.module';
import { ActivitiesModule } from './activities/activities.module';
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
    ProductsModule,
    CategoriesModule,
    TagsModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DishesModule,
    DishTagsModule,
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
