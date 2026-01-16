import { Router } from "express";
import {
  createSubscription,
  getMySubscriptions,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
} from "./subscription.controller";
import { protect } from "../shared/middlewares/protect";

const router = Router();

router.use(protect);

router.route("/").get(getMySubscriptions).post(createSubscription);
router.get("/stats", getSubscriptionStats);
router.route("/:id").patch(updateSubscription).delete(deleteSubscription);

export default router;
