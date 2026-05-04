import { AIProcessor } from "../processor/ai.processor.js"
import { AIService } from "../service/ai.service.js"
import { registereAISbuscriber } from "../subscriber/ai.subscriber.js";




export const initAIModule=()=>{
    const processor=new AIProcessor(new AIService);
    registereAISbuscriber(processor)
}