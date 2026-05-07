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
    findByUserId:(userId:string)=>
        prisma.device.findMany({
            where:{userId}
        })
    ,
    delete:(id:string)=>
        prisma.device.delete({
            where:{id}
        })
    
}
