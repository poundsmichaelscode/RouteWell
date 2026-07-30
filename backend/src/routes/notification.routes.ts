import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { idParams } from "../validators/resource.validator";

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get("/", asyncHandler(notificationController.list));
notificationRouter.patch("/read-all", asyncHandler(notificationController.markAllRead));
notificationRouter.patch("/:id/read", validate(idParams), asyncHandler(notificationController.markRead));
