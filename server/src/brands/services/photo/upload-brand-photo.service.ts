import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UploadBrandPhotoService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async execute(
    id: string,
    file: Express.Multer.File,
    userId: string,
    isAdmin: boolean,
  ) {
    // 1. Проверка существования бренда
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }

    // 2. Проверка прав доступа
    // Может загрузить: админ или создатель бренда
    const isCreator = brand.createdBy === userId;
    if (!isAdmin && !isCreator) {
      throw new BadRequestException(
        'Только администратор или создатель бренда может загружать фото',
      );
    }

    // 3. Загрузка в Cloudinary
    const photoUrl = await this.cloudinary.uploadImage(file, 'brands');

    // 4. Добавление URL в массив photos
    const updated = await this.prisma.brand.update({
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
      totalPhotos: updated.photos.length,
    };
  }
}
