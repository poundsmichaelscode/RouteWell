import type { Request, Response } from "express";
import { DeliveryService } from "../services/delivery.service";

const service = new DeliveryService();
export const deliveryController = {
  list: async (request: Request, response: Response) => {
    const { page, limit, search } = request.query as unknown as { page: number; limit: number; search?: string };
    response.json({ success: true, ...(await service.list(page, limit, search)) });
  },
  get: async (request: Request, response: Response) => response.json({ success: true, data: await service.get(request.params.id!) }),
  create: async (request: Request, response: Response) => response.status(201).json({ success: true, data: await service.create(request.body) }),
  update: async (request: Request, response: Response) => response.json({ success: true, data: await service.update(request.params.id!, request.body) }),
  status: async (request: Request, response: Response) => response.json({ success: true, data: await service.updateStatus(request.params.id!, request.body.status, request.body, request.user!.id) }),
  remove: async (request: Request, response: Response) => { await service.remove(request.params.id!); response.status(204).send(); }
};
