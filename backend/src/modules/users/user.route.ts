import { Router } from "express";
import {
  updateMe,
  updatePassword,
  deleteMe,
  requestEmailChange,
  verifyEmailChange,
} from "./user.controller";
import { protect } from "../shared/middlewares/protect";

const router = Router();

router.patch("/verify-email-change/:token", verifyEmailChange);

router.use(protect);

router.post("/request-email-change", requestEmailChange);
router.patch("/update-me", updateMe);
router.patch("/update-password", updatePassword);
router.delete("/delete-me", deleteMe);

export default router;
