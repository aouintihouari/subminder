import { Request, Response } from "express";
import { createExpense, getExpenses } from "../expense.controller";
import { expenseService } from "../expense.service";

jest.mock("../expense.service");

describe("ExpenseController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = { user: { id: 1 } as any, body: {} };
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock } as unknown as Response;
    jest.clearAllMocks();
  });

  describe("createExpense", () => {
    it("should return 201 and created expense", async () => {
      req.body = { amount: 10 };
      (expenseService.create as jest.Mock).mockResolvedValue({
        id: 1,
        amount: 10,
      });

      await createExpense(req as Request, res as Response);

      expect(expenseService.create).toHaveBeenCalledWith(1, req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ id: 1, amount: 10 });
    });
  });

  describe("getExpenses", () => {
    it("should return list of expenses", async () => {
      (expenseService.getAll as jest.Mock).mockResolvedValue([{ id: 1 }]);

      await getExpenses(req as Request, res as Response);

      expect(expenseService.getAll).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith([{ id: 1 }]);
    });
  });
});
