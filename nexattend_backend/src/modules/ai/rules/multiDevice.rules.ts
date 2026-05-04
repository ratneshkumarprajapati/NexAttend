

export const multiDeviceRule = (activeDevices: number) => {
    if (activeDevices > 1) {
        return { score: -0.4, reason: "Multiple devices detected" };
    }
    return { score: 0, reason: null };

}