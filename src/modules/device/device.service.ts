import { hashMac } from "../../utils/hash.util.js"
import { deviceRepository } from "./device.repository.js";



export const deviceService={
    async registerDevice(userId:number,data:any){
        const hashedMac=hashMac(data.macAddress);
        //check if already exist

        const existingDevice=await deviceRepository.findHashedMac(
            hashedMac
        )
        if (existingDevice) {
            throw new Error("Device already registered");
        }
        const deviceRepoRes=await deviceRepository.create({
            userId,
            deviceName:data.deviceName,
            hashedMac
        });
        return deviceRepoRes

    },
    async getUserDevice(userId:number){
        return deviceRepository.findByUserId(userId)
    },
    async identifyDevice(macAddress:string){
        const hashedMac=hashMac(macAddress);
        return deviceRepository.findHashedMac(hashedMac)
    }

}