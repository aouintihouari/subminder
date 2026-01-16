import { Request, Response } from "express";

import { categoryService } from "./category.service";

export const getCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getAll(req.user!.id);
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const newCategory = await categoryService.create(req.user!.id, req.body);
  res.status(201).json(newCategory);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await categoryService.delete(req.user!.id, Number(id));
  res.json(result);
};
