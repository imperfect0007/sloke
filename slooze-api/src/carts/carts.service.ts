import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { AddCartItemInput } from './dto/add-cart-item.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';

@Injectable()
export class CartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly restaurants: RestaurantsService,
  ) {}

  private async getOrCreateCartId(userId: string) {
    const existing = await this.prisma.cart.findUnique({ where: { userId } });
    if (existing) return existing.id;
    const created = await this.prisma.cart.create({ data: { userId } });
    return created.id;
  }

  async myCart(user: AuthUser) {
    const cartId = await this.getOrCreateCartId(user.id);
    return this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: { items: { include: { menuItem: true } } },
    });
  }

  async addItem(user: AuthUser, input: AddCartItemInput) {
    await this.restaurants.getMenuItemInUserCountry(user, input.menuItemId);
    const cartId = await this.getOrCreateCartId(user.id);
    const qty = input.quantity ?? 1;
    await this.prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: { cartId, menuItemId: input.menuItemId },
      },
      create: {
        cartId,
        menuItemId: input.menuItemId,
        quantity: qty,
      },
      update: {
        quantity: { increment: qty },
      },
    });
    return this.myCart(user);
  }

  async updateItem(user: AuthUser, input: UpdateCartItemInput) {
    const cartId = await this.getOrCreateCartId(user.id);
    const row = await this.prisma.cartItem.findFirst({
      where: { id: input.cartItemId, cartId },
      include: { menuItem: { include: { restaurant: true } } },
    });
    if (!row) {
      throw new NotFoundException('Cart item not found');
    }
    if (row.menuItem.restaurant.country !== user.country) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.update({
      where: { id: row.id },
      data: { quantity: input.quantity },
    });
    return this.myCart(user);
  }

  async removeItem(user: AuthUser, cartItemId: string) {
    const cartId = await this.getOrCreateCartId(user.id);
    const row = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId },
      include: { menuItem: { include: { restaurant: true } } },
    });
    if (!row) {
      throw new NotFoundException('Cart item not found');
    }
    if (row.menuItem.restaurant.country !== user.country) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.delete({ where: { id: row.id } });
    return this.myCart(user);
  }
}
