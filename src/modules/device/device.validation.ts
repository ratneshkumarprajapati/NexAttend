import { z } from "zod"

export const registerDeviceSchema = z.object({
    deviceName: z.string().optional(),
    macAddress: z.string(),
})