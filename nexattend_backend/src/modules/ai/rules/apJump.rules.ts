
export const apJumpRule = (apChanges: number) => {
  if (apChanges > 3) {
    return { score: -0.3, reason: "Frequent AP switching" };
  }
  return { score: 0, reason: null };
};