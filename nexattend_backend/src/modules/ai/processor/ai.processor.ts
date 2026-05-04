import { getDuration } from "../../../utils/getDuration.js";
import logger from "../../../utils/logger.js";
import type { AIService } from "../service/ai.service.js";



export class AIProcessor {
    constructor(private service: AIService) { }

    async handleSessionCompleted(session: any) {
        const duration = getDuration(session);
        const result = await this.service
            .evaluateSession({
                sessionId: session.id,
                userId: session.userId,
                deviceId: session.deviceId,
                startTime: session.startTime,
                endTime: session.endTime,
                duration,
         
         
            })
         logger.info("AI Result:", result);
        //  TODO:Update db
    }

}