import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    console.log('[PrismaService boot]', {
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlLen: (process.env.DATABASE_URL || '').length,
    });
    const rawConnection = process.env.DATABASE_URL || '';
    // Удаляем возможные внешние кавычки, например DATABASE_URL="..."
    let connectionString = rawConnection.trim();
    if (
      (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
      (connectionString.startsWith("'") && connectionString.endsWith("'"))
    ) {
      connectionString = connectionString.slice(1, -1);
    }

    let pool: pg.Pool;
    try {
      if (connectionString) {
        const url = new URL(connectionString);
        if (typeof url.password !== 'string' || url.password.length === 0) {
          throw new Error(
            '[PrismaService] DATABASE_URL must include a password (user:password@host). Password is missing.',
          );
        }
        // Декодируем компоненты и явно приводим пароль к строке
        const rawPassword = url.password
          ? decodeURIComponent(url.password)
          : undefined;
        const password =
          rawPassword !== undefined ? String(rawPassword) : undefined;

        // Безопасная отладочная информация: тип и длина, без вывода самого пароля
        /* eslint-disable no-console */
        console.debug(
          '[PrismaService] DATABASE_URL present:',
          !!connectionString,
        );
        console.debug(
          `[PrismaService] db password type=${typeof password} length=${password ? password.length : 0}`,
        );
        /* eslint-enable no-console */

        pool = new pg.Pool({
          host: url.hostname,
          port: url.port ? parseInt(url.port, 10) : undefined,
          user: url.username || undefined,
          password: password || undefined,
          database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
          // SSL: отключаем если в URL есть sslmode=disable, иначе на проде включаем
          ssl: connectionString.includes('sslmode=disable')
            ? false
            : process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
        });
      } else {
        pool = new pg.Pool();
      }
    } catch (e) {
      // fallback: создаём пул по connectionString, чтобы не ломать старые конфиги
      pool = new pg.Pool({ connectionString });
    }

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
