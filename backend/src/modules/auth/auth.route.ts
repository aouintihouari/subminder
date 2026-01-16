import { Router } from "express";

import {
  signup,
  login,
  logout,
  verifyEmail,
  getMe,
  forgotPassword,
  resetPassword,
} from "./auth.controller";
import { protect } from "../shared/middlewares/protect";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
