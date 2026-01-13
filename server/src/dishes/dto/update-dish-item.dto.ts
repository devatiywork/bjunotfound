import { PartialType } from '@nestjs/swagger';
import { AddDishItemDto } from './add-dish-item.dto';

/**
 * DTO для обновления ингредиента блюда
 */
export class UpdateDishItemDto extends PartialType(AddDishItemDto) {}
