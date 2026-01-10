import { NextFunction, Request, Response, CookieOptions } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import { signupSchema, loginSchema } from "../schemas/authSchema";
import { AppError } from "../utils/AppError";
import { emailService } from "../services/email.service";

/**
 * Generates a JSON Web Token (JWT) for user authentication
 *
 * @param {number} id - The user ID to be encoded in the token
 * @returns {string} The signed JWT containing the user ID
 *
 * @example
 * const token = signToken(123);
 * console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "90d") as any,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user.id);

  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production" ||
      process.env.FRONTEND_URL?.startsWith("https"),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({ status: "success", data: { user } });
};

/**
 * Handles user registration/signup process
 * @param {Request} req - Express request object containing user registration data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Returns a promise that resolves when the signup process is complete
 * @throws {AppError} Throws an error if the email is already in use (409 status)
 * @description
 * This function:
 * - Validates the request body against signupSchema
 * - Checks if email already exists in database
 * - Hashes the password using bcrypt
 * - Generates email verification token
 * - Creates new user in database
 * - Sends verification email
 * - Returns success response with user data
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const validated = signupSchema.parse({ body: req.body });
  const { email, password, name } = validated.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("This email is already in use", 409);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt,
      isVerified: false,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  await emailService.sendVerificationEmail(
    newUser.email,
    newUser.name || "User",
    verificationToken
  );

  res.status(201).json({
    status: "success",
    message:
      "User registered successfully. Please check your email to verify your account.",
    data: { user: newUser },
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;

  if (!token) throw new AppError("Verification token is missing", 400);

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Invalid or expired verification token", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully! You can now log in.",
  });
};

/**
 * Handles user login authentication.
 *
 * @description This function authenticates a user by validating their credentials,
 * checking if the email is verified, and generating a JWT token upon successful login.
 *
 * @param {Request} req - The Express request object containing user login credentials in the body
 * @param {Response} res - The Express response object used to send back the authentication result
 *
 * @returns {Promise<void>} Returns a promise that resolves when the authentication process is complete
 *
 * @throws {AppError} Throws an error with status 401 if email or password is invalid
 * @throws {AppError} Throws an error with status 403 if user's email is not verified
 *
 * @example
 * // Request body example:
 * // {
 * //   "email": "user@example.com",
 * //   "password": "password123"
 * // }
 *
 * // Success response example:
 * // {
 * //   "status": "success",
 * //   "token": "jwt_token_here",
 * //   "data": {
 * //     "user": {
 * //       "id": "user_id",
 * //       "email": "user@example.com",
 * //       "name": "User Name",
 * //       "role": "user_role"
 * //     }
 * //   }
 * // }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const validated = loginSchema.parse({ body: req.body });
  const { email, password } = validated.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new AppError("Invalid email or password", 401);

  if (!user.isVerified)
    throw new AppError("Please verify your email to log in", 403);

  createSendToken(user, 200, res);
};

export const logout = (_: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

/**
 * Retrieves the current user's information.
 * @param {Request} req - Express request object containing user data
 * @param {Response} res - Express response object
 * @param {NextFunction} _ - Express next function (unused)
 * @returns {void} Sends a JSON response with user data
 */
export const getMe = async (req: Request, res: Response, _: NextFunction) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
};
