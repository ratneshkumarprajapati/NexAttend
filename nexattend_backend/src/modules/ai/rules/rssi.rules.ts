export const rssiRule=(avgRssi:number)=>{
    if(avgRssi<-80){
        return {
            score:-0.3,
            reason:"Weak signal"
        }
    }
    return { score: 0, reason: null };
}