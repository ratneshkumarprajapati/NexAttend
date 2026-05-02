import { registerPresenceSubscribers } from "../subscriber/presence.subscriber.js";


export const initPresenceModule = () => {
    registerPresenceSubscribers();
};