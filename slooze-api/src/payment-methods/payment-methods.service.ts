import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { CreatePaymentMethodInput } from './dto/create-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AuthUser) {
    return this.prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(user: AuthUser, input: CreatePaymentMethodInput) {
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }
    return this.prisma.paymentMethod.create({
      data: {
        userId: user.id,
        label: input.label,
        last4: input.last4,
        isDefault: input.isDefault ?? false,
      },
    });
  }

  async update(user: AuthUser, input: UpdatePaymentMethodInput) {
    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id: input.id, userId: user.id },
    });
    if (!existing) {
      throw new NotFoundException('Payment method not found');
    }
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }
    return this.prisma.paymentMethod.update({
      where: { id: input.id },
      data: {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.last4 !== undefined ? { last4: input.last4 } : {}),
        ...(input.isDefault !== undefined
          ? { isDefault: input.isDefault }
          : {}),
      },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      throw new NotFoundException('Payment method not found');
    }
    await this.prisma.paymentMethod.delete({ where: { id } });
    if (existing.isDefault) {
      const next = await this.prisma.paymentMethod.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.paymentMethod.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
    return true;
  }
}
