import { Router } from "express";

import {
  signup,
  login,
  logout,
  verifyEmail,
  getMe,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/protect";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, getMe);

export default router;
