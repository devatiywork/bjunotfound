import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeletePhotoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async execute(id: string, photoUrl: string) {
    // 1. Проверка существования категории
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // 2. Проверка наличия фото в массиве
    if (!category.photos.includes(photoUrl)) {
      throw new NotFoundException(
        `Фотография не найдена в категории с ID "${id}"`,
      );
    }

    // 3. Удаление фото из Cloudinary
    try {
      await this.cloudinary.deleteImage(photoUrl);
    } catch (error) {
      // Если фото не удалось удалить из Cloudinary, продолжаем (возможно, оно уже удалено)
      console.warn('Не удалось удалить фото из Cloudinary:', error.message);
    }

    // 4. Удаление URL из массива photos
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        photos: category.photos.filter((url) => url !== photoUrl),
      },
    });

    return {
      message: 'Фото успешно удалено',
      category: {
        id: updated.id,
        photos: updated.photos,
      },
    };
  }
}
