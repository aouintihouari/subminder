import { Router } from "express";
import {
  createSubscription,
  getMySubscriptions,
} from "../controllers/subscription.controller";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);

router.route("/").get(getMySubscriptions).post(createSubscription);

export default router;
