import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Получает максимальный размер файла из переменных окружения
 * По умолчанию 5MB
 */
export const getMaxFileSize = (): number => {
  const defaultSize = 5 * 1024 * 1024; // 5MB
  const envSize = process.env.MAX_FILE_SIZE_MB;

  if (envSize) {
    const parsed = parseFloat(envSize);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed * 1024 * 1024;
    }
  }

  return defaultSize;
};

/**
 * Стандартные настройки Multer для загрузки изображений
 */
export const imageUploadOptions: MulterOptions = {
  limits: {
    fileSize: getMaxFileSize(),
  },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP',
        ),
        false,
      );
    }

    callback(null, true);
  },
};
