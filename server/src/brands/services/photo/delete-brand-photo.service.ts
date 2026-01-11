import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteBrandPhotoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async execute(id: string, photoUrl: string) {
    // 1. Проверка существования бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Проверка наличия фото
    if (!brand.photos.includes(photoUrl)) {
      throw new BadRequestException(
        'Фото не найдено в списке фотографий бренда',
      );
    }

    // 3. Удаление из Cloudinary
    try {
      await this.cloudinary.deleteImage(photoUrl);
    } catch (error) {
      // Логируем ошибку, но продолжаем удаление из БД
      console.error('Ошибка при удалении из Cloudinary:', error);
    }

    // 4. Удаление URL из массива photos
    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        photos: {
          set: brand.photos.filter((url) => url !== photoUrl),
        },
      },
    });

    return {
      message: 'Фото успешно удалено',
      totalPhotos: updated.photos.length,
    };
  }
}
