export const getDuration = (session: any) =>
    (new Date(session.endTime).getTime() -
        new Date(session.startTime).getTime()) /
    1000;