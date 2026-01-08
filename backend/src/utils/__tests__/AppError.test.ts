import { AppError } from "../AppError";

describe("AppError", () => {
  it("should create an error with correct properties", () => {
    const error = new AppError("Something wrong", 400);

    expect(error.message).toBe("Something wrong");
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe("fail");
    expect(error.isOperational).toBe(true);
  });

  it("should set status to error for 500 codes", () => {
    const error = new AppError("Server crash", 500);
    expect(error.status).toBe("error");
  });
});
