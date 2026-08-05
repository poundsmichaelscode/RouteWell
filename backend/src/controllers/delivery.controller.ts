import type { Request, Response } from "express";
import { DeliveryService } from "../services/delivery.service";
import { routeParam } from "../utils/route-param";
import { validatedQuery } from "../utils/request-data";
import { requireUser } from "../utils/request-user";

const service = new DeliveryService();

export const deliveryController = {
  list: async (request: Request, response: Response) => {
    const { page, limit, search } = validatedQuery<{
      page: number;
      limit: number;
      search?: string;
    }>(request);
    response.json({
      success: true,
      ...(await service.list(page, limit, search, requireUser(request)))
    });
  },

  get: async (request: Request, response: Response) => {
    response.json({
      success: true,
      data: await service.get(routeParam(request), requireUser(request))
    });
  },

  create: async (request: Request, response: Response) => {
    response.status(201).json({
      success: true,
      data: await service.create(request.body, requireUser(request))
    });
  },

  update: async (request: Request, response: Response) => {
    response.json({
      success: true,
      data: await service.update(routeParam(request), request.body, requireUser(request))
    });
  },

  status: async (request: Request, response: Response) => {
    const data = await service.updateStatus(
      routeParam(request),
      request.body.status,
      request.body,
      requireUser(request)
    );
    response.json({ success: true, data });
  },

  remove: async (request: Request, response: Response) => {
    await service.remove(routeParam(request), requireUser(request));
    response.status(204).send();
  }
};
