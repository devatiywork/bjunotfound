import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UploadProductUserPhotoService {
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
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Нет прав для загрузки фото этого продукта');
    }

    // 3. Загрузка в Cloudinary
    const photoUrl = await this.cloudinary.uploadImage(file, 'products-user');

    // 4. Добавление URL в массив photos
    const updated = await this.prisma.productUser.update({
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
