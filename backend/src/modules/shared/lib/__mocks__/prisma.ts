import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

const mockPrisma = mockDeep<PrismaClient>();

export const prismaMock = mockPrisma as unknown as DeepMockProxy<PrismaClient>;

export { mockPrisma as prisma };
