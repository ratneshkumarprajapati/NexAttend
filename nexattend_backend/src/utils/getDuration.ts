type SessionDurationInput = {
    startTime: Date | string;
    endTime: Date | string | null;
};

export const getDuration = (session: SessionDurationInput) => {
    if (!session.endTime) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(
            (new Date(session.endTime).getTime() -
                new Date(session.startTime).getTime()) /
            1000
        )
    );
};
