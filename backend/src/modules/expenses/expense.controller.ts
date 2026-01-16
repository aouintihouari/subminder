import { Request, Response } from "express";
import { expenseService } from "./expense.service";

export const createExpense = async (req: Request, res: Response) => {
  const expense = await expenseService.create(req.user!.id, req.body);
  res.status(201).json(expense);
};

export const getExpenses = async (req: Request, res: Response) => {
  const expenses = await expenseService.getAll(req.user!.id);
  res.json(expenses);
};

export const getExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await expenseService.getOne(req.user!.id, Number(id));
  res.json(expense);
};

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = await expenseService.update(
    req.user!.id,
    Number(id),
    req.body
  );
  res.json(expense);
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await expenseService.delete(req.user!.id, Number(id));
  res.json(result);
};
