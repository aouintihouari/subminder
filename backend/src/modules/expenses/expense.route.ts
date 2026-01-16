import { Router } from "express";
import { protect } from "../shared/middlewares/protect";
import { validateRequest } from "../shared/middlewares/validateRequest";
import { createExpenseSchema, updateExpenseSchema } from "./expense.schema";
import * as expenseController from "./expense.controller";

const router = Router();

router.use(protect);

router.post(
  "/",
  validateRequest(createExpenseSchema),
  expenseController.createExpense
);

router.get("/", expenseController.getExpenses);
router.get("/:id", expenseController.getExpense);

router.patch(
  "/:id",
  validateRequest(updateExpenseSchema),
  expenseController.updateExpense
);

router.delete("/:id", expenseController.deleteExpense);

export default router;
