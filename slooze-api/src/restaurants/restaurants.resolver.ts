import { Query, Resolver } from '@nestjs/graphql';
import { RestaurantsService } from './restaurants.service';
import { RestaurantModel } from './models/restaurant.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@Resolver(() => RestaurantModel)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [RestaurantModel])
  restaurants(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.listForUser(user);
  }
}
