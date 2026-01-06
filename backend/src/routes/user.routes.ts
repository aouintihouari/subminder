import { Router } from "express";
import {
  updateMe,
  updatePassword,
  deleteMe,
} from "../controllers/user.controller";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);

router.patch("/update-me", updateMe);
router.patch("/update-password", updatePassword);
router.delete("/delete-me", deleteMe);

export default router;
