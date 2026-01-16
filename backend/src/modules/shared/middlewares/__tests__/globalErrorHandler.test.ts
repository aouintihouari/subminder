import { Request, Response } from "express";
import globalErrorHandler from "../globalErrorHandler";
import { AppError } from "../../utils/AppError";

describe("Global Error Handler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {};
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    next = jest.fn();
  });

  it("should handle operational AppError", () => {
    const error = new AppError("Test Error", 400);

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "fail",
        message: "Test Error",
      })
    );
  });

  it("should handle default 500 errors", () => {
    const error = new Error("System Crash");
    globalErrorHandler(error, req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        message: "Something went wrong!",
      })
    );
  });
});
