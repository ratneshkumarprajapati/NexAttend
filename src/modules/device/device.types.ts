import type { Request } from "express";

export interface RegisterDeviceInput{
    deviceName?:string;
    macAddress:string;
}
export interface AuthenticatedRequest extends Request{
    user:{

        userId:number,
        publicId:string
    }
}