import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  photos: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryTreeNode[];
}

@Injectable()
export class GetCategoryTreeService {
  constructor(private prisma: PrismaService) {}

  async execute(
    isAdmin: boolean = false,
  ): Promise<{ tree: CategoryTreeNode[] }> {
    // Получаем все категории одним запросом
    const categories = await this.prisma.category.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Строим дерево из плоского списка
    const tree = this.buildTree(categories);

    return { tree };
  }

  /**
   * Построение дерева из плоского списка категорий
   */
  private buildTree(
    categories: any[],
    parentId: string | null = null,
  ): CategoryTreeNode[] {
    const nodes: CategoryTreeNode[] = [];

    for (const category of categories) {
      if (category.parentId === parentId) {
        const node: CategoryTreeNode = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          photos: category.photos,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          children: this.buildTree(categories, category.id),
        };
        nodes.push(node);
      }
    }

    return nodes;
  }
}
