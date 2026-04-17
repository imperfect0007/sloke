import { PrismaClient, Role, Country } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    {
      email: 'admin.india@slooze.test',
      role: Role.ADMIN,
      country: Country.INDIA,
    },
    {
      email: 'admin.us@slooze.test',
      role: Role.ADMIN,
      country: Country.AMERICA,
    },
    {
      email: 'manager.india@slooze.test',
      role: Role.MANAGER,
      country: Country.INDIA,
    },
    {
      email: 'manager.us@slooze.test',
      role: Role.MANAGER,
      country: Country.AMERICA,
    },
    {
      email: 'member.india@slooze.test',
      role: Role.MEMBER,
      country: Country.INDIA,
    },
    {
      email: 'member.us@slooze.test',
      role: Role.MEMBER,
      country: Country.AMERICA,
    },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: { ...u, password },
    });
  }

  const indiaRestaurants = [
    { name: 'Spice Route', items: ['Paneer Tikka', 499, 'Masala Dosa', 199, 'Chai', 49] },
    { name: 'Bombay Bites', items: ['Vada Pav', 79, 'Biryani', 349, 'Gulab Jamun', 99] },
  ];

  const usRestaurants = [
    { name: 'Liberty Diner', items: ['Classic Burger', 899, 'Milkshake', 499, 'Fries', 299] },
    { name: 'Pacific Tacos', items: ['Carnitas Taco', 349, 'Guacamole', 199, 'Horchata', 249] },
  ];

  for (const r of indiaRestaurants) {
    await prisma.restaurant.create({
      data: {
        name: r.name,
        country: Country.INDIA,
        menuItems: {
          create: pairs(r.items).map(([name, price]) => ({ name, priceCents: price })),
        },
      },
    });
  }

  for (const r of usRestaurants) {
    await prisma.restaurant.create({
      data: {
        name: r.name,
        country: Country.AMERICA,
        menuItems: {
          create: pairs(r.items).map(([name, price]) => ({ name, priceCents: price })),
        },
      },
    });
  }

  const adminIndia = await prisma.user.findFirstOrThrow({
    where: { email: 'admin.india@slooze.test' },
  });
  await prisma.paymentMethod.createMany({
    data: [
      { userId: adminIndia.id, label: 'Visa', last4: '4242', isDefault: true },
      { userId: adminIndia.id, label: 'Corporate', last4: '0001', isDefault: false },
    ],
  });

  console.log('Seed complete. Use *@slooze.test / password123');
}

function pairs(arr: (string | number)[]): [string, number][] {
  const out: [string, number][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    out.push([arr[i] as string, arr[i + 1] as number]);
  }
  return out;
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
