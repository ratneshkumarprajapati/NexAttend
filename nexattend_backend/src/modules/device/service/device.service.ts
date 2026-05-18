import { hashMac } from "../../../utils/hash.util.js"
import { deviceRepository } from "../repository/device.repository.js";



export const deviceService={
    async registerDevice(userId:string,data:any){
        const hashedMac=data.macAddress ? hashMac(data.macAddress) : null;
        //check if already exist

        if (hashedMac) {
            const existingDevice=await deviceRepository.findHashedMac(
                hashedMac
            )
            if (existingDevice) {
                throw new Error("Device already registered");
            }
        }
        const deviceRepoRes=await deviceRepository.create({
            userId,
            deviceName:data.deviceName,
            hashedMac,
            phoneNo:data.phoneNo
        });
        return deviceRepoRes

    },
    async getUserDevice(userId:string){
        return deviceRepository.findByUserId(userId)
    },
    async identifyDevice(macAddress:string){
        const hashedMac=hashMac(macAddress);
        return deviceRepository.findHashedMac(hashedMac)
    }

}
