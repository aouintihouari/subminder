import { Router } from "express";
import {
  createSubscription,
  getMySubscriptions,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscription.controller";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);

router.route("/").get(getMySubscriptions).post(createSubscription);
router.route("/:id").patch(updateSubscription).delete(deleteSubscription);

export default router;
