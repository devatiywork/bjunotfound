import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import cloudinary from './cloudinary.config.js';

@Injectable()
export class CloudinaryService {
  /**
   * Загружает файл в Cloudinary
   * @param file - Файл из multer
   * @returns URL загруженного изображения
   */
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    // Валидация типа файла
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP',
      );
    }

    // Валидация размера (макс 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'Размер файла превышает 5MB. Пожалуйста, загрузите файл меньшего размера',
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products', // Папка в Cloudinary
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Ограничение размера
            { quality: 'auto' }, // Автоматическая оптимизация качества
            { fetch_format: 'auto' }, // Автоматический выбор формата (WebP для поддерживаемых браузеров)
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(
              new InternalServerErrorException(
                'Ошибка при загрузке изображения',
              ),
            );
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      // Отправляем buffer файла в Cloudinary
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Удаляет изображение из Cloudinary по URL
   * @param imageUrl - URL изображения из Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Извлекаем public_id из URL
      // Пример URL: https://res.cloudinary.com/dvxl9xlts/image/upload/v1234567890/products/abc123.jpg
      const publicId = this.extractPublicIdFromUrl(imageUrl);

      if (!publicId) {
        throw new BadRequestException('Некорректный URL изображения');
      }

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new InternalServerErrorException('Ошибка при удалении изображения');
    }
  }

  /**
   * Извлекает public_id из URL Cloudinary
   * @param url - URL изображения
   * @returns public_id или null
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // URL формат: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
