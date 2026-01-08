import { Request, Response } from "express";
import { updateMe, updatePassword, deleteMe } from "../user.controller";
import { userService } from "../../services/user.service";

jest.mock("../../services/user.service");

describe("UserController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      user: { id: 1 } as any,
      body: {},
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    jest.clearAllMocks();
  });

  describe("updateMe", () => {
    it("should update user profile", async () => {
      req.body = { name: "John Updated" };
      const mockUser = {
        id: 1,
        name: "John Updated",
        email: "test@test.com",
        role: "USER",
      };

      (userService.updateProfile as jest.Mock).mockResolvedValue(mockUser);

      await updateMe(req as Request, res as Response);

      expect(userService.updateProfile).toHaveBeenCalledWith(1, {
        name: "John Updated",
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        data: { user: mockUser },
      });
    });
  });

  describe("updatePassword", () => {
    it("should update password successfully", async () => {
      req.body = {
        currentPassword: "oldPass123",
        newPassword: "newPass123",
        passwordConfirm: "newPass123",
      };

      await updatePassword(req as Request, res as Response);

      expect(userService.updatePassword).toHaveBeenCalledWith(
        1,
        "oldPass123",
        "newPass123"
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "Password updated successfully",
      });
    });
  });

  describe("deleteMe", () => {
    it("should delete user account", async () => {
      await deleteMe(req as Request, res as Response);

      expect(userService.deleteUser).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(204);
    });
  });
});
