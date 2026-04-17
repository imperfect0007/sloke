import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethodModel {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field()
  last4!: string;

  @Field()
  isDefault!: boolean;
}
