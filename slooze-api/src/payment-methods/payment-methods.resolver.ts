import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodModel } from './models/payment-method.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentMethodInput } from './dto/create-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';

@Resolver(() => PaymentMethodModel)
@UseGuards(RolesGuard)
export class PaymentMethodsResolver {
  constructor(private readonly paymentMethods: PaymentMethodsService) {}

  @Roles(Role.ADMIN)
  @Query(() => [PaymentMethodModel])
  myPaymentMethods(@CurrentUser() user: AuthUser) {
    return this.paymentMethods.list(user);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => PaymentMethodModel)
  addPaymentMethod(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreatePaymentMethodInput,
  ) {
    return this.paymentMethods.create(user, input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => PaymentMethodModel)
  updatePaymentMethod(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdatePaymentMethodInput,
  ) {
    return this.paymentMethods.update(user, input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Boolean)
  removePaymentMethod(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.paymentMethods.remove(user, id);
  }
}
