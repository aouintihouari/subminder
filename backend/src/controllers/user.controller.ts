import { Request, Response } from "express";

import { userService } from "../services/user.service";
import { emailService } from "../services/email.service";
import {
  updateMeSchema,
  updatePasswordSchema,
  requestEmailChangeSchema,
} from "../schemas/userSchema";

export const updateMe = async (req: Request, res: Response) => {
  const validated = updateMeSchema.parse({ body: req.body });
  const { name, preferredCurrency } = validated.body;
  const updatedUser = await userService.updateProfile(req.user!.id, {
    name,
    preferredCurrency,
  });

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

export const requestEmailChange = async (req: Request, res: Response) => {
  const validated = requestEmailChangeSchema.parse({ body: req.body });
  const { newEmail } = validated.body;
  const { user, token } = await userService.requestEmailChange(
    req.user!.id,
    newEmail
  );

  await emailService.sendEmailChangeVerification(
    newEmail,
    user.name || "User",
    token
  );

  res.status(200).json({
    status: "success",
    message: "Verification link sent to your new email address.",
  });
};

export const verifyEmailChange = async (req: Request, res: Response) => {
  const { token } = req.params;
  await userService.verifyEmailChange(token);

  res
    .status(200)
    .json({ status: "success", message: "Email successfully updated!" });
};
