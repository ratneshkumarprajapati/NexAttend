import { accessPointRepository } from "../repository/accesspoint.repository.js";
import { AppError } from "../../../utils/appError.js";
import type {
  CreateAccessPointInput,
  RouterAccessPointIdentity,
  UpdateAccessPointInput,
} from "../types/accesspoint.types.js";

export const accessPointService = {
  createAccessPoint: async (data: CreateAccessPointInput) => {
    return accessPointRepository.create(data);
  },

  ensureAccessPointForSsidIndex: async (
    ssidIndex?: number | null,
    router?: RouterAccessPointIdentity,
  ) => {
    if (ssidIndex === undefined || ssidIndex === null) {
      return null;
    }

    const routerKey = router?.routerKey || "default";

    return accessPointRepository.upsertByRouterAndSsidIndex(routerKey, ssidIndex, {
      ssidIndex,
      routerKey,
      routerName: router?.routerName,
      routerProvider: router?.routerProvider,
      name: `${router?.routerName || "Router"} SSID ${ssidIndex}`,
      location: router?.routerName || "Router",
      isActive: true,
    });
  },

  getAllAccessPoints: async () => {
    return accessPointRepository.findAll();
  },

  getAccessPointById: async (id: number) => {
    const ap = await accessPointRepository.findById(id);
    if (!ap) {
      throw new AppError("Access point not found", 404);
    }
    return ap;
  },

  updateAccessPoint: async (
    id: number,
    data: UpdateAccessPointInput,
  ) => {
    await accessPointService.getAccessPointById(id);
    return accessPointRepository.update(id, data);
  },

  deleteAccessPoint: async (id: number) => {
    await accessPointService.getAccessPointById(id);
    return accessPointRepository.delete(id);
  },
};
