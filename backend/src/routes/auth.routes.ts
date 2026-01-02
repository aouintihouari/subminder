import { Router } from "express";

import { signup, verifyEmail, login } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

export default router;
