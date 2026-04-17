import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(user: AuthUser) {
    return this.prisma.restaurant.findMany({
      where: { country: user.country },
      orderBy: { name: 'asc' },
      include: { menuItems: { orderBy: { name: 'asc' } } },
    });
  }

  async getMenuItemInUserCountry(user: AuthUser, menuItemId: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurant: { country: user.country },
      },
      include: { restaurant: true },
    });
    if (!item) {
      throw new NotFoundException('Menu item not found in your country');
    }
    return item;
  }
}
