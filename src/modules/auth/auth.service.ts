import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { withActiveSpan } from "../../instrumentation/otel.js";
import logger from "../../utils/logger.js";
import { AppError } from "../../utils/appError.js";
import { toAuthResponseDto } from "./auth.dto.js";
import { toUserResponseDto } from "../user/user.dto.js";
import { userService } from "../user/user.service.js";
import type {
  AuthTokenPayload,
  ILoginInput,
  IRegisterInput,
} from "./auth.types.js";

const JWT_EXPIRES_IN = "7d";

export const authService = {
  generateToken(payload: AuthTokenPayload) {
    return jwt.sign(payload, env.SECURITY.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, env.SECURITY.JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  },

  async register(data: IRegisterInput) {
    const runRegister = async () => {
      logger.info(`Registering user with email: ${data.email}`);

      const user = await userService.createUser({
        email: data.email,
        password: data.password,
        role: data.role,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNo: data.phoneNo,
        },
      });

      const token = this.generateToken({
        publicId: user.publicId,
        email: user.email,
        role: user.role,
      });

      logger.info(`User registered successfully with publicId: ${user.publicId}`);
      return toAuthResponseDto(toUserResponseDto(user), token);
    };

    return withActiveSpan(
      "auth.register",
      {
        "auth.email": data.email,
        "auth.role": data.role,
      },
      runRegister,
    );
  },

  async login(data: ILoginInput) {
    logger.info(`Logging in user with email: ${data.email}`);
    let user;
    try {
      user = await userService.getUserByEmail(data.email);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        logger.warn(`Login failed because user was not found: ${data.email}`);
        throw new AppError("Invalid email or password", 401);
      }
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Login failed because password did not match for: ${data.email}`);
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.generateToken({
      publicId: user.publicId,
      email: user.email,
      role: user.role,
    });

    this.verifyToken(token);

    logger.info(`User logged in successfully with publicId: ${user.publicId}`);
    return toAuthResponseDto(toUserResponseDto(user), token);
  },
};
