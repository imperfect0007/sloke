import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MenuItemModel } from '../../restaurants/models/menu-item.model';

@ObjectType()
export class CartItemModel {
  @Field()
  id!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => MenuItemModel)
  menuItem!: MenuItemModel;
}
