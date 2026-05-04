import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { RouterService } from "../services/router.service.js";

const RawQuerySchema = z.object({
  routerKey: z.string().min(1)
});

export class RouterController {
  constructor(private readonly service: RouterService) {}

  devices = (_req: Request, res: Response): void => {
    const snapshot = this.service.getDevices();
    res.json({
      devices: snapshot.devices,
      timestamp: snapshot.timestamp,
      failures: snapshot.failures
    });
  };

  health = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routers = await this.service.getHealth();
      res.json({
        status: routers.every((router) => router.available) ? "ok" : "degraded",
        routers
      });
    } catch (error) {
      next(error);
    }
  };

  status = (_req: Request, res: Response): void => {
    res.json({ routers: this.service.getRouterStatus() });
  };

  raw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { routerKey } = RawQuerySchema.parse(req.query);
      res.json({ routerKey, raw: await this.service.getRaw(routerKey) });
    } catch (error) {
      next(error);
    }
  };
}
