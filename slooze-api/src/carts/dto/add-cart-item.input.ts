import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class AddCartItemInput {
  @Field()
  @IsUUID()
  menuItemId!: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
