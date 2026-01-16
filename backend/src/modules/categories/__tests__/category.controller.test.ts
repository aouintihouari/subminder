import { Request, Response } from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../category.controller";
import { categoryService } from "../category.service";

jest.mock("../category.service");

describe("CategoryController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = { user: { id: 1 } as any, body: {}, params: {} };
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock } as unknown as Response;
    jest.clearAllMocks();
  });

  describe("getCategories", () => {
    it("should return list of categories", async () => {
      (categoryService.getAll as jest.Mock).mockResolvedValue([
        { id: 1, name: "Test" },
      ]);

      await getCategories(req as Request, res as Response);

      expect(categoryService.getAll).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith([{ id: 1, name: "Test" }]);
    });
  });

  describe("createCategory", () => {
    it("should return 201 and created category", async () => {
      req.body = { name: "New Cat" };
      (categoryService.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: "New Cat",
      });

      await createCategory(req as Request, res as Response);

      expect(categoryService.create).toHaveBeenCalledWith(1, req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ id: 1, name: "New Cat" });
    });
  });

  describe("deleteCategory", () => {
    it("should return result message", async () => {
      req.params = { id: "1" };
      (categoryService.delete as jest.Mock).mockResolvedValue({
        message: "Deleted",
      });

      await deleteCategory(req as Request, res as Response);

      expect(categoryService.delete).toHaveBeenCalledWith(1, 1);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Deleted" });
    });
  });
});
