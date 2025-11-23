import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const demoUsers = [
  { email: 'customer@test.com', password: 'customer123', role: UserRole.CUSTOMER },
  { email: 'admin@test.com', password: 'admin123', role: UserRole.ADMIN },
];

async function main() {
  for (const entry of demoUsers) {
    const hashedPassword = await bcrypt.hash(entry.password, 10);
    await prisma.user.upsert({
      where: { email: entry.email },
      update: {
        passwordHash: hashedPassword,
        role: entry.role,
      },
      create: {
        email: entry.email,
        passwordHash: hashedPassword,
        role: entry.role,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Upserted demo user ${entry.email}`);
  }
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to seed demo users', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
