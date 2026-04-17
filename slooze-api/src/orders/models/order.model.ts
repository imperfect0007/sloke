import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Country, OrderStatus } from '@prisma/client';
import { OrderItemModel } from './order-item.model';

@ObjectType()
export class OrderModel {
  @Field()
  id!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => Country)
  country!: Country;

  @Field(() => Int)
  totalCents!: number;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => [OrderItemModel])
  items!: OrderItemModel[];
}
