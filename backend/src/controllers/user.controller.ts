import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { updateMeSchema, updatePasswordSchema } from "../schemas/userSchema";

export const updateMe = async (req: Request, res: Response) => {
  const validated = updateMeSchema.parse({ body: req.body });
  const { name } = validated.body;
  const updatedUser = await userService.updateProfile(req.user!.id, { name });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
};

export const updatePassword = async (req: Request, res: Response) => {
  const validated = updatePasswordSchema.parse({ body: req.body });
  const { currentPassword, newPassword } = validated.body;
  await userService.updatePassword(req.user!.id, currentPassword, newPassword);

  res
    .status(200)
    .json({ status: "success", message: "Password updated successfully" });
};

export const deleteMe = async (req: Request, res: Response) => {
  await userService.deleteUser(req.user!.id);

  res.status(204).json({ status: "success", data: null });
};
