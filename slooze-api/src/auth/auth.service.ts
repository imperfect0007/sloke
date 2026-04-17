import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './auth.types';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const password = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password,
        role: input.role,
        country: input.country,
      },
    });
    return this.issueTokens(user);
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  private issueTokens(user: {
    id: string;
    email: string;
    role: AuthUser['role'];
    country: AuthUser['country'];
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      country: user.country,
    };
    return {
      accessToken: this.jwt.sign(payload),
      userId: user.id,
      role: user.role,
      country: user.country,
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        country: true,
        createdAt: true,
      },
    });
  }
}
