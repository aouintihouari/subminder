import { Router } from "express";

import { protect } from "../shared/middlewares/protect";
import { validateRequest } from "../shared/middlewares/validateRequest";
import { createCategorySchema } from "./category.schema";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "./category.controller";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(getCategories)
  .post(validateRequest(createCategorySchema), createCategory);

router.delete("/:id", deleteCategory);

export default router;
