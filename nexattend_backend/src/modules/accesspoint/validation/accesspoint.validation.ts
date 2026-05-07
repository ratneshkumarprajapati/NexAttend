import { z } from "zod";

export const accessPointIdParamSchema = z.object({
  id: z.uuid("Access point id must be a valid UUID"),
});

export const createAccessPointSchema = z.object({
  name: z.string().trim().min(1, "Access point name is required"),
  routerKey: z.string().trim().min(1).optional(),
  routerName: z.string().trim().optional(),
  routerProvider: z.string().trim().optional(),
  location: z.string().trim().optional(),
  ssidIndex: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const updateAccessPointSchema = createAccessPointSchema.partial();
