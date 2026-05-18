import { z } from "zod"

export const registerDeviceSchema = z.object({
    deviceName: z.string().optional(),
    macAddress: z.string().optional(),
    phoneNo: z.string().optional(),
}).refine((data) => data.macAddress || data.phoneNo, {
    message: "macAddress or phoneNo is required",
})
