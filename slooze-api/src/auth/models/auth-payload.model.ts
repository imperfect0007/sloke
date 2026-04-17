import { Field, ObjectType } from '@nestjs/graphql';
import { Country, Role } from '@prisma/client';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field()
  userId!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => Country)
  country!: Country;
}
