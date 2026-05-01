import { eventBus } from "../../events/eventBus.js";
import logger from "../../utils/logger.js";
import { PresenceProcessor } from "./presence.processor.js";
import { PresenceRepository } from "./presence.repository.js"
import { PresenceService } from "./presence.service.js";





export const registerPresenceSubscribers = () => {
    const repo = new PresenceRepository();
    const service = new PresenceService(repo);
    const processor = new PresenceProcessor(service);
    eventBus.on("device:connected", (payload) => {
        // logger.info("inside device connected event ")
        void processor.handleDeviceConnected(payload);
    });

    eventBus.on("device:seen", (payload) => {
        void processor.handleDeviceConnected(payload);
    });

    eventBus.on("device:disconnected", (payload) => {
        void processor.handleDeviceDisconnected(payload);
    });
}
