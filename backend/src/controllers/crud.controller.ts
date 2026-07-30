import type { Request, Response } from "express";
import { CrudService } from "../services/crud.service";
const service = new CrudService();
const query = (request: Request) => request.query as unknown as { page: number; limit: number; search?: string };

export const crudController = {
  customers: async (req: Request, res: Response) => res.json({ success: true, ...(await service.customers(query(req).page, query(req).limit, query(req).search)) }),
  createCustomer: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createCustomer(req.body) }),
  updateCustomer: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateCustomer(req.params.id!, req.body) }),
  deleteCustomer: async (req: Request, res: Response) => { await service.deleteCustomer(req.params.id!); res.status(204).send(); },
  drivers: async (req: Request, res: Response) => res.json({ success: true, ...(await service.drivers(query(req).page, query(req).limit, query(req).search)) }),
  createDriver: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createDriver(req.body) }),
  updateDriver: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateDriver(req.params.id!, req.body) }),
  deleteDriver: async (req: Request, res: Response) => { await service.deleteDriver(req.params.id!); res.status(204).send(); },
  vehicles: async (req: Request, res: Response) => res.json({ success: true, ...(await service.vehicles(query(req).page, query(req).limit, query(req).search)) }),
  createVehicle: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createVehicle(req.body) }),
  updateVehicle: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateVehicle(req.params.id!, req.body) }),
  deleteVehicle: async (req: Request, res: Response) => { await service.deleteVehicle(req.params.id!); res.status(204).send(); },
  routes: async (req: Request, res: Response) => res.json({ success: true, ...(await service.routes(query(req).page, query(req).limit, query(req).search)) }),
  createRoute: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await service.createRoute(req.body) }),
  updateRoute: async (req: Request, res: Response) => res.json({ success: true, data: await service.updateRoute(req.params.id!, req.body) }),
  deleteRoute: async (req: Request, res: Response) => { await service.deleteRoute(req.params.id!); res.status(204).send(); }
};
