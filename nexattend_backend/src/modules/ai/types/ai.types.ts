type Status="VALID" | "SUSPICIOUS" | "REJECTED"
export interface AISessionInput{
    sessionId:string;
    userId:string;
    deviceId:string;
    startTime:Date;
    endTime:Date;
    duration:number;
}

export interface AIResult{
    confidenceScore:number;
    status:Status;
    reasion:string[];

}
