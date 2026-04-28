export type UserRole = "STUDENT" | "ADMIN";

export interface IRegisterInput {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneNo: string;
}

export interface ILoginInput {
    email: string;
    password: string;
}

export interface AuthTokenPayload {
    userId:number,
    publicId: string;
    email: string;
    role: UserRole;
}
export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

