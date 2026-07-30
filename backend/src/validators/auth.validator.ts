import { z } from "zod";

const password = z.string().min(12).max(128).regex(/[a-z]/, "Must include lowercase").regex(/[A-Z]/, "Must include uppercase").regex(/\d/, "Must include a number");

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().email().toLowerCase(),
    password
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const loginSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase(), password: z.string().min(1) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
