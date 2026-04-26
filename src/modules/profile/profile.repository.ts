import prisma from "../../services/prisma/prisma.client.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { ICreateProfileInput, IUpdateInput } from "./profile.types.js";

const toPreparationGoalInput = (
  value: ICreateProfileInput["preprationGoal"] | IUpdateInput["preprationGoal"]
): Prisma.InputJsonValue | undefined => value;

const toCreateData = (data: ICreateProfileInput): Prisma.ProfileUncheckedCreateInput => {
  const createData: Prisma.ProfileUncheckedCreateInput = {
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
  };

  if (data.phoneNo !== undefined) createData.phoneNo = data.phoneNo;
  if (data.avatarUrl !== undefined) createData.avatarUrl = data.avatarUrl;
  if (data.department !== undefined) createData.department = data.department;
  if (data.enrolmentNo !== undefined) createData.enrolmentNo = data.enrolmentNo;
  if (data.year !== undefined) createData.year = data.year;

  const preprationGoal = toPreparationGoalInput(data.preprationGoal);
  if (preprationGoal !== undefined) createData.preprationGoal = preprationGoal;

  return createData;
};

const toUpdateData = (data: IUpdateInput): Prisma.ProfileUpdateInput => {
  const updateData: Prisma.ProfileUpdateInput = {};

  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.phoneNo !== undefined) updateData.phoneNo = data.phoneNo;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.enrolmentNo !== undefined) updateData.enrolmentNo = data.enrolmentNo;
  if (data.year !== undefined) updateData.year = data.year;

  const preprationGoal = toPreparationGoalInput(data.preprationGoal);
  if (preprationGoal !== undefined) updateData.preprationGoal = preprationGoal;

  return updateData;
};

export const profileRepository = {
  findByUserId: (userId: number) => prisma.profile.findUnique({ where: { userId } }),

  create: (data: ICreateProfileInput) =>
    prisma.profile.create({
      data: toCreateData(data),
    }),

  update: (userId: number, data: IUpdateInput) =>
    prisma.profile.update({
      where: { userId },
      data: toUpdateData(data),
    }),
};
