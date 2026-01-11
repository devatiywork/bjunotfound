import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteProductUserPhotoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async execute(
    id: string,
    photoUrl: string,
    userId: string,
    isAdmin: boolean,
  ) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Нет прав для удаления фото этого продукта');
    }

    // 3. Проверка наличия фото
    if (!product.photos.includes(photoUrl)) {
      throw new BadRequestException(
        'Фото не найдено в списке фотографий продукта',
      );
    }

    // 4. Удаление из Cloudinary
    try {
      await this.cloudinary.deleteImage(photoUrl);
    } catch (error) {
      console.error('Ошибка при удалении из Cloudinary:', error);
    }

    // 5. Удаление URL из массива photos
    const updated = await this.prisma.productUser.update({
      where: { id },
      data: {
        photos: {
          set: product.photos.filter((url) => url !== photoUrl),
        },
      },
    });

    return {
      message: 'Фото успешно удалено',
      totalPhotos: updated.photos.length,
    };
  }
}
