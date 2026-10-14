import { PrismaClient, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@weddingplanner.test' },
    update: { passwordHash },
    create: { email: 'demo@weddingplanner.test', passwordHash },
  });
  const wedding = await prisma.wedding.upsert({
    where: { userId: user.id },
    update: {
      name: 'Alex & Sam',
      groomName: 'Alex',
      brideName: 'Sam',
      date: new Date('2027-06-12'),
      location: 'Chateau Bela',
      budget: 25000,
    },
    create: {
      userId: user.id,
      name: 'Alex & Sam',
      groomName: 'Alex',
      brideName: 'Sam',
      date: new Date('2027-06-12'),
      location: 'Chateau Bela',
      budget: 25000,
    },
  });
  await prisma.guest.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.budgetItem.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.task.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.guest.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: 'Jamie Novak',
        email: 'jamie@example.com',
        attendance: AttendanceStatus.ATTENDING,
        accompanyingGuests: 1,
      },
      {
        weddingId: wedding.id,
        name: 'Taylor Smith',
        email: 'taylor@example.com',
        attendance: AttendanceStatus.PENDING,
        accompanyingGuests: 0,
      },
    ],
  });
  await prisma.budgetItem.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: 'Venue',
        category: 'Venue',
        estimatedCost: 8500,
        actualCost: 8000,
      },
      { weddingId: wedding.id, name: 'Flowers', category: 'Decor', estimatedCost: 1800 },
    ],
  });
  await prisma.task.createMany({
    data: [
      {
        weddingId: wedding.id,
        title: 'Book photographer',
        description: 'Confirm the full-day package',
        dueDate: new Date('2027-01-15'),
      },
      { weddingId: wedding.id, title: 'Send invitations', dueDate: new Date('2027-03-01') },
    ],
  });
  console.log('Seeded demo@weddingplanner.test / password123');
}
main().finally(() => prisma.$disconnect());
