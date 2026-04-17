import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CartsService } from './carts.service';
import { CartModel } from './models/cart.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { AddCartItemInput } from './dto/add-cart-item.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';

@Resolver(() => CartModel)
export class CartsResolver {
  constructor(private readonly carts: CartsService) {}

  @Query(() => CartModel)
  myCart(@CurrentUser() user: AuthUser) {
    return this.carts.myCart(user);
  }

  @Mutation(() => CartModel)
  addCartItem(
    @CurrentUser() user: AuthUser,
    @Args('input') input: AddCartItemInput,
  ) {
    return this.carts.addItem(user, input);
  }

  @Mutation(() => CartModel)
  updateCartItem(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateCartItemInput,
  ) {
    return this.carts.updateItem(user, input);
  }

  @Mutation(() => CartModel)
  removeCartItem(
    @CurrentUser() user: AuthUser,
    @Args('cartItemId') cartItemId: string,
  ) {
    return this.carts.removeItem(user, cartItemId);
  }
}
