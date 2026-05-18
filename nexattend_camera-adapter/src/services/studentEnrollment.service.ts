import axios from "axios";
import type { AppConfig } from "../config/app.config.js";
import { logger } from "../utils/logger.js";

export type EnrolledStudent = {
  id: string;
  name: string;
  photoUrl: string;
};

type BackendUser = {
  id: string;
  role?: string;
  email?: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
};

type BackendResponse = {
  data?: BackendUser[];
};

export class StudentEnrollmentService {
  constructor(private readonly config: AppConfig["enrollment"]) {}

  async fetchStudents(): Promise<EnrolledStudent[]> {
    const url = new URL(this.config.studentsPath, this.config.backendBaseUrl).toString();
    const { data } = await axios.get<BackendResponse | BackendUser[]>(url, {
      headers: this.config.apiToken
        ? { authorization: `Bearer ${this.config.apiToken}` }
        : undefined,
    });
    const users = Array.isArray(data) ? data : data.data ?? [];
    const students = users
      .filter((user) => (user.role ?? "STUDENT") === "STUDENT")
      .map((user) => toEnrolledStudent(user, this.config.backendBaseUrl))
      .filter((student): student is EnrolledStudent => Boolean(student));

    logger.info("Fetched enrolled student photos", {
      context: "StudentEnrollmentService",
      count: students.length,
    });

    return students;
  }
}

function toEnrolledStudent(
  user: BackendUser,
  backendBaseUrl: string,
): EnrolledStudent | null {
  const photoUrl = user.profile?.avatarUrl;
  if (!photoUrl) return null;

  return {
    id: user.id,
    name: [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ") || user.email || user.id,
    photoUrl: new URL(photoUrl, backendBaseUrl).toString(),
  };
}
