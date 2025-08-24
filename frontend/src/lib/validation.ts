import { z } from "zod";

const forbiddenSymbols = /[<>]/;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .refine((val) => !forbiddenSymbols.test(val), {
      message: "Email cannot contain < or > symbols",
    }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((val) => !forbiddenSymbols.test(val), {
      message: "Password cannot contain < or > symbols",
    }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .refine((val) => !forbiddenSymbols.test(val), {
      message: "Email cannot contain < or > symbols",
    }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(24, "Name must be at most 24 characters")
    .refine((val) => !forbiddenSymbols.test(val), {
      message: "Name cannot contain < or > symbols",
    }),
  email: z
    .string()
    .email("Please enter a valid email")
    .refine((val) => !forbiddenSymbols.test(val), {
      message: "Email cannot contain < or > symbols",
    }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must be at most 32 characters")
    .refine((val) => !forbiddenSymbols.test(val), {
      message: "Password cannot contain < or > symbols",
    }),
});
