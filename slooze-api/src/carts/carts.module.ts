import { Module } from '@nestjs/common';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { CartsResolver } from './carts.resolver';
import { CartsService } from './carts.service';

@Module({
  imports: [RestaurantsModule],
  providers: [CartsResolver, CartsService],
})
export class CartsModule {}
