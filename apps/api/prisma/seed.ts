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
      name: 'Marian & Kristina',
      groomName: 'Marian',
      brideName: 'Kristina',
      date: new Date('2026-10-25'),
      location: 'Sála Bačíkova',
      budget: 20000,
    },
    create: {
      userId: user.id,
      name: 'Marian & Kristina',
      groomName: 'Marian',
      brideName: 'Kristina',
      date: new Date('2026-10-25'),
      location: 'Sála Bačíkova',
      budget: 20000,
    },
  });
  await prisma.guest.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.budgetItem.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.task.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.guest.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: 'Janko Hrasko',
        email: 'jankohrasko@test.com',
        attendance: AttendanceStatus.PENDING,
        accompanyingGuests: 0,
      },
      {
        weddingId: wedding.id,
        name: 'Jozko Mrkvicka',
        email: null,
        attendance: AttendanceStatus.PENDING,
        accompanyingGuests: 0,
      },
      {
        weddingId: wedding.id,
        name: 'Marienka Novakova',
        email: 'novakova@test.com',
        attendance: AttendanceStatus.ATTENDING,
        accompanyingGuests: 1,
      },
    ],
  });
  await prisma.budgetItem.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: 'Sala Bacikova',
        category: 'Venue',
        estimatedCost: 6300,
        actualCost: 6300,
      },
      {
        weddingId: wedding.id,
        name: 'Catering',
        category: 'Catering',
        estimatedCost: 3500,
        actualCost: 3500,
      },
      {
        weddingId: wedding.id,
        name: 'Foto Marian',
        category: 'Photography',
        estimatedCost: 945,
        actualCost: 945,
      },
      {
        weddingId: wedding.id,
        name: 'Sylband',
        category: 'Music',
        estimatedCost: 1350,
        actualCost: 1350,
      },
    ],
  });
  await prisma.task.createMany({
    data: [
      {
        weddingId: wedding.id,
        title: 'Kvety',
        description: 'Vybavit vyzdobu saly',
        dueDate: new Date('2026-10-18'),
        completed: false,
      },
      {
        weddingId: wedding.id,
        title: 'Kolace',
        description: 'Odniest kolace do saly',
        dueDate: new Date('2026-10-24'),
        completed: false,
      },
      {
        weddingId: wedding.id,
        title: 'Sala',
        description: 'Zarezervovat Salu Bacikovu',
        dueDate: new Date('2026-10-15'),
        completed: true,
      },
    ],
  });
  console.log('Seeded demo@weddingplanner.test / password123');
}
main().finally(() => prisma.$disconnect());
