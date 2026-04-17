import { Field, ObjectType } from '@nestjs/graphql';
import { CartItemModel } from './cart-item.model';

@ObjectType()
export class CartModel {
  @Field()
  id!: string;

  @Field(() => [CartItemModel])
  items!: CartItemModel[];
}
