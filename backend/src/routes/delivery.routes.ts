import { Router } from "express";
import { Role } from "@prisma/client";
import { deliveryController } from "../controllers/delivery.controller";
import { audit } from "../middleware/audit";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { deliveryCreate, deliveryStatusUpdate, deliveryUpdate, idParams, listQuery } from "../validators/resource.validator";

export const deliveryRouter = Router();
deliveryRouter.use(authenticate);
deliveryRouter.get("/", validate(listQuery), asyncHandler(deliveryController.list));
deliveryRouter.get("/:id", validate(idParams), asyncHandler(deliveryController.get));
deliveryRouter.post("/", authorize(Role.ADMIN, Role.MANAGER, Role.DISPATCHER), validate(deliveryCreate), audit("CREATE", "Delivery"), asyncHandler(deliveryController.create));
deliveryRouter.patch("/:id", authorize(Role.ADMIN, Role.MANAGER, Role.DISPATCHER), validate(deliveryUpdate), audit("UPDATE", "Delivery"), asyncHandler(deliveryController.update));
deliveryRouter.patch("/:id/status", authorize(Role.ADMIN, Role.MANAGER, Role.DISPATCHER, Role.DRIVER), validate(deliveryStatusUpdate), audit("STATUS_CHANGE", "Delivery"), asyncHandler(deliveryController.status));
deliveryRouter.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), validate(idParams), audit("DELETE", "Delivery"), asyncHandler(deliveryController.remove));
