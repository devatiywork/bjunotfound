import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DishTagsController } from './dish-tags.controller';
import { DishTagsService } from './dish-tags.service';

@Module({
  imports: [PrismaModule],
  providers: [DishTagsService],
  controllers: [DishTagsController],
  exports: [DishTagsService],
})
export class DishTagsModule {}
