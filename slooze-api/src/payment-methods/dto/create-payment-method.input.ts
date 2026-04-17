import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  @IsString()
  @MinLength(2)
  label!: string;

  @Field()
  @IsString()
  @Length(4, 4)
  last4!: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
