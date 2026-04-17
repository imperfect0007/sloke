import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { Public } from './decorators/public.decorator';
import { AuthPayload } from './models/auth-payload.model';
import { UserModel } from './models/user.model';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput) {
    return this.auth.register(input);
  }

  @Public()
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.auth.login(input);
  }

  @Query(() => UserModel)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
