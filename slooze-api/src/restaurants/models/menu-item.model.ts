import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MenuItemModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  priceCents!: number;

  @Field()
  restaurantId!: string;
}
