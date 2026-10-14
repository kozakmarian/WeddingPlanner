import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import { signToken } from '../../middleware/auth.js';

const publicUser = { id: true, email: true, createdAt: true } as const;
export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUser }>;

export async function register(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { email, passwordHash }, select: publicUser });
      await tx.wedding.create({
        data: {
          userId: created.id,
          name: 'My Wedding',
          groomName: null,
          brideName: null,
          date: new Date(),
          location: 'To be decided',
        },
      });
      return created;
    });
    return { user, token: signToken(user.id) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'An account with this email already exists.', 'DUPLICATE_ACCOUNT');
    }
    throw error;
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...publicUser, passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  }
  const { passwordHash: _passwordHash, ...publicUserData } = user;
  return { user: publicUserData, token: signToken(user.id) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUser });
  if (!user) throw new AppError(401, 'Authentication token is invalid.', 'UNAUTHENTICATED');
  return user;
}
