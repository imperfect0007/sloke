import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdatePaymentMethodInput {
  @Field()
  @IsUUID()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  last4?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
