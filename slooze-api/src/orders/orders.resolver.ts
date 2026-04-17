import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { OrderModel } from './models/order.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckoutInput } from './dto/checkout.input';

@Resolver(() => OrderModel)
@UseGuards(RolesGuard)
export class OrdersResolver {
  constructor(private readonly orders: OrdersService) {}

  @Query(() => [OrderModel])
  myOrders(@CurrentUser() user: AuthUser) {
    return this.orders.myOrders(user);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => OrderModel)
  checkout(
    @CurrentUser() user: AuthUser,
    @Args('input', { nullable: true }) input?: CheckoutInput,
  ) {
    return this.orders.checkout(user, input ?? {});
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Mutation(() => OrderModel)
  cancelOrder(@CurrentUser() user: AuthUser, @Args('orderId') orderId: string) {
    return this.orders.cancelOrder(user, orderId);
  }
}
