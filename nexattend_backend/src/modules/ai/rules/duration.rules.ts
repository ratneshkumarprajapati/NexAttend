
export const durationRule = (duration: number) => {
    if (duration < 120) {
        return {
            score: -0.5,
            reason: "Too short session"
        }
    }
    return { score: 0, reason: null };
}