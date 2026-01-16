import { Router } from "express";

import { protect } from "../shared/middlewares/protect";
import { validateRequest } from "../shared/middlewares/validateRequest";
import { createCategorySchema } from "./category.schema";
import * as categoryController from "./category.controller";

const router = Router();

router.use(protect);

router.get("/", categoryController.getCategories);

router.post(
  "/",
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

router.delete("/:id", categoryController.deleteCategory);

export default router;
