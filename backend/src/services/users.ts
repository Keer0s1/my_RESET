import { hashPass } from "../utils/hashPass";
import prisma from "../db";

export async function createUser(username: string, email: string, password: string) {

  const hashedPass = await hashPass(password);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPass,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  return newUser;
}