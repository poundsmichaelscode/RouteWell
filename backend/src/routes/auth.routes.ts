import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { authRateLimit } from "../middleware/rate-limit";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { profileUpdate } from "../validators/resource.validator";
import { audit } from "../middleware/audit";

export const authRouter = Router();
authRouter.post("/register", authRateLimit, validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", authRateLimit, validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", authRateLimit, asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.patch("/me", authenticate, validate(profileUpdate), audit("UPDATE", "Profile"), asyncHandler(authController.updateMe));
