type Status="VALID" | "SUSPICIOUS" | "REJECTED"
export interface AISessionInput{
    sessionId:number;
    userId:number;
    deviceId:number;
    startTime:Date;
    endTime:Date;
    duration:number;
}

export interface AIResult{
    confidenceScore:number;
    status:Status;
    reasion:string[];

}