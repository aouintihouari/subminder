import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import { prisma } from "../prisma";

const mockPrisma = mockDeep<PrismaClient>();

export const prismaMock = mockPrisma as unknown as DeepMockProxy<PrismaClient>;

export { mockPrisma as prisma };
