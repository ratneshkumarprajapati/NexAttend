import type { AuthTokenPayload } from "../modules/auth/auth.types.ts";


declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      cookies: {
        token?: string;
        [key: string]: any;
      };
    }
  }
}

export {};