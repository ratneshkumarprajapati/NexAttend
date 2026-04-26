import type { Prisma } from "../../generated/prisma/client.js";

export interface IProfile {
  id: number;
  publicId: string;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNo: string | null;
  avatarUrl: string | null;
  department: string | null;
  enrolmentNo: string | null;
  year: number | null;
  preprationGoal: Prisma.JsonValue | null;
  createdAt: Date;
}

export interface ICreateProfileInput {
  userId: number;
  firstName: string;
  lastName: string;
  phoneNo?: string | undefined;
  avatarUrl?: string | undefined;
  department?: string | undefined;
  enrolmentNo?: string | undefined;
  year?: number | undefined;
  preprationGoal?: Prisma.InputJsonValue | undefined;
}

export interface IUpdateInput {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phoneNo?: string | undefined;
  avatarUrl?: string | undefined;
  department?: string | undefined;
  enrolmentNo?: string | undefined;
  year?: number | undefined;
  preprationGoal?: Prisma.InputJsonValue | undefined;
}
