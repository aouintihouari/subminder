import { Router } from "express";
import { protect } from "../shared/middlewares/protect";
import { validateRequest } from "../shared/middlewares/validateRequest";
import { createExpenseSchema, updateExpenseSchema } from "./expense.schema";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "./expense.controller";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(getExpenses)
  .post(validateRequest(createExpenseSchema), createExpense);

router
  .route("/:id")
  .get(getExpenses)
  .patch(validateRequest(updateExpenseSchema), updateExpense)
  .delete(deleteExpense);

export default router;
