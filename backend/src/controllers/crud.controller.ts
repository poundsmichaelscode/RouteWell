import type { Request, Response } from "express";
import { CrudService } from "../services/crud.service";
import { routeParam } from "../utils/route-param";
import { validatedQuery } from "../utils/request-data";

const service = new CrudService();
const query = (request: Request) => validatedQuery<{ page: number; limit: number; search?: string }>(request);

export const crudController = {
  customers: async (req: Request, res: Response) => res.json({ success: true, ...(await service.customers(query(req).page, query(req).limit, query(req).search)) }),
  createCustomer: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createCustomer(req.body) }),
  updateCustomer: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateCustomer(routeParam(req), req.body) }),
  deleteCustomer: async (req: Request, res: Response) => { await service.deleteCustomer(routeParam(req)); res.status(204).send(); },
  drivers: async (req: Request, res: Response) => res.json({ success: true, ...(await service.drivers(query(req).page, query(req).limit, query(req).search)) }),
  createDriver: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createDriver(req.body) }),
  updateDriver: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateDriver(routeParam(req), req.body) }),
  deleteDriver: async (req: Request, res: Response) => { await service.deleteDriver(routeParam(req)); res.status(204).send(); },
  vehicles: async (req: Request, res: Response) => res.json({ success: true, ...(await service.vehicles(query(req).page, query(req).limit, query(req).search)) }),
  createVehicle: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createVehicle(req.body) }),
  updateVehicle: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateVehicle(routeParam(req), req.body) }),
  deleteVehicle: async (req: Request, res: Response) => { await service.deleteVehicle(routeParam(req)); res.status(204).send(); },
  routes: async (req: Request, res: Response) => res.json({ success: true, ...(await service.routes(query(req).page, query(req).limit, query(req).search)) }),
  createRoute: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createRoute(req.body) }),
  updateRoute: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateRoute(routeParam(req), req.body) }),
  deleteRoute: async (req: Request, res: Response) => { await service.deleteRoute(routeParam(req)); res.status(204).send(); }
};
