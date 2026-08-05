import { Role } from "@prisma/client";
import { Router, type RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { crudController } from "../controllers/crud.controller";
import { audit } from "../middleware/audit";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import {
  customerCreate,
  customerUpdate,
  driverCreate,
  driverUpdate,
  idParams,
  listQuery,
  routeCreate,
  routeUpdate,
  vehicleCreate,
  vehicleUpdate
} from "../validators/resource.validator";

type AsyncRequestHandler = Parameters<typeof asyncHandler>[0];

type ResourceRouteConfig = {
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  list: AsyncRequestHandler;
  create: AsyncRequestHandler;
  update: AsyncRequestHandler;
  remove: AsyncRequestHandler;
  entity: string;
};

function resourceRoutes(config: ResourceRouteConfig): Router {
  const router = Router();
  const readers: RequestHandler = authorize(
    Role.ADMIN,
    Role.MANAGER,
    Role.DISPATCHER,
    Role.VIEWER
  );
  const editors: RequestHandler = authorize(Role.ADMIN, Role.MANAGER, Role.DISPATCHER);
  const administrators: RequestHandler = authorize(Role.ADMIN, Role.MANAGER);

  router.use(authenticate);
  router.get("/", readers, validate(listQuery), asyncHandler(config.list));
  router.post("/", editors, validate(config.createSchema), audit("CREATE", config.entity), asyncHandler(config.create));
  router.patch("/:id", editors, validate(config.updateSchema), audit("UPDATE", config.entity), asyncHandler(config.update));
  router.delete("/:id", administrators, validate(idParams), audit("DELETE", config.entity), asyncHandler(config.remove));

  return router;
}

export const customerRouter = resourceRoutes({
  createSchema: customerCreate,
  updateSchema: customerUpdate,
  list: crudController.customers,
  create: crudController.createCustomer,
  update: crudController.updateCustomer,
  remove: crudController.deleteCustomer,
  entity: "Customer"
});

export const driverRouter = resourceRoutes({
  createSchema: driverCreate,
  updateSchema: driverUpdate,
  list: crudController.drivers,
  create: crudController.createDriver,
  update: crudController.updateDriver,
  remove: crudController.deleteDriver,
  entity: "Driver"
});

export const vehicleRouter = resourceRoutes({
  createSchema: vehicleCreate,
  updateSchema: vehicleUpdate,
  list: crudController.vehicles,
  create: crudController.createVehicle,
  update: crudController.updateVehicle,
  remove: crudController.deleteVehicle,
  entity: "Vehicle"
});

export const routeRouter = resourceRoutes({
  createSchema: routeCreate,
  updateSchema: routeUpdate,
  list: crudController.routes,
  create: crudController.createRoute,
  update: crudController.updateRoute,
  remove: crudController.deleteRoute,
  entity: "Route"
});
