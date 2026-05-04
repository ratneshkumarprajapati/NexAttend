//session evaluation

import { apJumpRule } from "../rules/apJump.rules.js";
import { durationRule } from "../rules/duration.rules.js";
import { multiDeviceRule } from "../rules/multiDevice.rules.js";
import { rssiRule } from "../rules/rssi.rules.js";
import type { AIResult, AISessionInput } from "../types/ai.types.js";


export class AIService {
    async evaluateSession(input: AISessionInput) {
        let score = 1;
        const reasons: string[] = [];

        // mock values (replace with real queries later)
        const avgRssi = -75;
        const activeDevices = 1;
        const apChanges = 1;

        const rules = [
            rssiRule(avgRssi),
            durationRule(input.duration),
            multiDeviceRule(activeDevices),
            apJumpRule(apChanges)

        ]


        for (const r of rules) {
            score += r.score;
            if (r.reason) reasons.push(r.reason);
        }

        // clamp score
        score = Math.max(0, Math.min(1, score));

        let status: AIResult["status"] = "VALID";

        if (score < 0.4) status = "REJECTED";
        else if (score < 0.7) status = "SUSPICIOUS";

        return {
            confidenceScore: score,
            status,
            reasons,
        };
    }





}



