import { Field, ObjectType } from '@nestjs/graphql';
import { Country } from '@prisma/client';
import { MenuItemModel } from './menu-item.model';

@ObjectType()
export class RestaurantModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => Country)
  country!: Country;

  @Field(() => [MenuItemModel])
  menuItems!: MenuItemModel[];
}
