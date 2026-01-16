import { mockReset, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserService } from "../user.service";

const prismaMock = mockDeep<PrismaClient>();
jest.mock("bcryptjs");
const userService = new UserService(prismaMock);

describe("UserService", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  describe("updateProfile", () => {
    it("should update user name", async () => {
      const mockUser = { id: 1, name: "New Name", email: "test@test.com" };
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const result = await userService.updateProfile(1, { name: "New Name" });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { name: "New Name" },
        })
      );
    });
  });

  describe("updatePassword", () => {
    it("should update password if current password is correct", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        password: "hashed_old_password",
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_new_password");
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");

      await userService.updatePassword(1, "oldPass", "newPass");

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "oldPass",
        "hashed_old_password"
      );
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: "hashed_new_password" },
      });
    });

    it("should throw error if current password is wrong", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        password: "hashed_old_password",
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.updatePassword(1, "wrongPass", "newPass")
      ).rejects.toThrow("Incorrect current password");
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      await userService.deleteUser(1);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
