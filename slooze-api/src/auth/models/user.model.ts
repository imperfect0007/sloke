import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Country, Role } from '@prisma/client';

@ObjectType()
export class UserModel {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => Country)
  country!: Country;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}
