import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UploadPhotoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async execute(id: string, file: Express.Multer.File) {
    // 1. Проверка существования категории
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }

    // 2. Загрузка фото в Cloudinary
    const photoUrl = await this.cloudinary.uploadImage(file, 'categories');

    // 3. Добавление URL в массив photos
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        photos: {
          push: photoUrl,
        },
      },
    });

    return {
      message: 'Фото успешно загружено',
      photoUrl,
      category: {
        id: updated.id,
        photos: updated.photos,
      },
    };
  }
}
