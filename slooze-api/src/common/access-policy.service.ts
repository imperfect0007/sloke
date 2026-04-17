import { ForbiddenException, Injectable } from '@nestjs/common';
import { Country } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';

/**
 * Re-BAC: relationship-aware checks (resource country vs subject country).
 */
@Injectable()
export class AccessPolicyService {
  assertSameCountry(
    user: AuthUser,
    resourceCountry: Country,
    message?: string,
  ) {
    if (user.country !== resourceCountry) {
      throw new ForbiddenException(
        message ?? 'This resource is outside your assigned country',
      );
    }
  }
}
