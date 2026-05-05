import { eventBus } from "../../../events/eventBus.js"




export const registereAISbuscriber=(processor:any)=>{

    eventBus.on("attendance:completed",(session)=>{
        void processor.handleSessionCompleted(session)
    })

}
