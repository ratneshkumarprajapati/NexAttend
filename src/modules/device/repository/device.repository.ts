import prisma from "../../../services/prisma/prisma.client.js";


export const deviceRepository={
    create:(data:any)=>
        prisma.device.create({data})

    ,
    findHashedMac:(hashedMac:string)=>
        prisma.device.findUnique({
            where:{hashedMac}
        })

    ,
    findByUserId:(userId:number)=>
        prisma.device.findMany({
            where:{userId}
        })
    ,
    delete:(id:number)=>
        prisma.device.delete({
            where:{id}
        })
    
}