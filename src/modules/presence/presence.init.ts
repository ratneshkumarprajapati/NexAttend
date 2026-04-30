import { registerPresenceSubscribers } from "./presence.subscriber.js";


export const initPresenceModule = () => {
    registerPresenceSubscribers();
};