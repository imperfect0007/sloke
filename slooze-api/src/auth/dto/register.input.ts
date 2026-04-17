import { Field, InputType } from '@nestjs/graphql';
import { Country, Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(6)
  password!: string;

  @Field(() => Role)
  @IsEnum(Role)
  role!: Role;

  @Field(() => Country)
  @IsEnum(Country)
  country!: Country;
}
