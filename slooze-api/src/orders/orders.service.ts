import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { AccessPolicyService } from '../common/access-policy.service';
import { CheckoutInput } from './dto/checkout.input';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessPolicyService,
  ) {}

  myOrders(user: AuthUser) {
    return this.prisma.order.findMany({
      where: { userId: user.id, country: user.country },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { menuItem: true } } },
    });
  }

  async checkout(user: AuthUser, input: CheckoutInput) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { menuItem: { include: { restaurant: true } } },
        },
      },
    });
    if (!cart?.items.length) {
      throw new BadRequestException('Cart is empty');
    }
    for (const line of cart.items) {
      this.access.assertSameCountry(
        user,
        line.menuItem.restaurant.country,
        'Cart contains items outside your country',
      );
    }

    if (input.paymentMethodId) {
      const pm = await this.prisma.paymentMethod.findFirst({
        where: { id: input.paymentMethodId, userId: user.id },
      });
      if (!pm) {
        throw new NotFoundException('Payment method not found');
      }
    }

    const totalCents = cart.items.reduce(
      (sum, i) => sum + i.menuItem.priceCents * i.quantity,
      0,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          country: user.country,
          status: OrderStatus.PAID,
          totalCents,
          items: {
            create: cart.items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              priceCents: i.menuItem.priceCents,
            })),
          },
        },
        include: { items: { include: { menuItem: true } } },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    return order;
  }

  async cancelOrder(user: AuthUser, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    this.access.assertSameCountry(user, order.country);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order already cancelled');
    }
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Only paid orders can be cancelled');
    }
    const isPrivileged = user.role === Role.ADMIN || user.role === Role.MANAGER;
    if (!isPrivileged && order.userId !== user.id) {
      throw new NotFoundException('Order not found');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: { include: { menuItem: true } } },
    });
  }
}
