import { signToken, getCookieOptions } from "../jwt.utils";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("JWT Utils", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("signToken", () => {
    it("should sign a token with correct payload and secret", () => {
      process.env.JWT_SECRET = "test-secret";
      process.env.JWT_EXPIRES_IN = "1d";

      (jwt.sign as jest.Mock).mockReturnValue("signed_token");

      const token = signToken(123);

      expect(jwt.sign).toHaveBeenCalledWith({ id: 123 }, "test-secret", {
        expiresIn: "1d",
      });
      expect(token).toBe("signed_token");
    });
  });

  describe("getCookieOptions", () => {
    it("should return secure options in production", () => {
      process.env.NODE_ENV = "production";

      const options = getCookieOptions();

      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe("none");
      expect(options.expires).toBeInstanceOf(Date);
    });

    it("should return lax options in development", () => {
      process.env.NODE_ENV = "development";
      delete process.env.FRONTEND_URL; // Assure que secure n'est pas activé par l'URL

      const options = getCookieOptions();

      expect(options.httpOnly).toBe(true);
      // Correction : on utilise toBeFalsy() pour accepter false ou undefined
      expect(options.secure).toBeFalsy();
      expect(options.sameSite).toBe("lax");
    });

    it("should set secure to true if frontend is https even in dev", () => {
      process.env.NODE_ENV = "development";
      process.env.FRONTEND_URL = "https://myapp.com";

      const options = getCookieOptions();

      expect(options.secure).toBe(true);
    });
  });
});
