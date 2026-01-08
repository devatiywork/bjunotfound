import { PartialType } from '@nestjs/swagger';
import { CreateDishTagDto } from './create-dish-tag.dto';

export class UpdateDishTagDto extends PartialType(CreateDishTagDto) {}
