import type { UserResponseDto } from "../../user/dto/user.dto.js";

type AuthUser = {
  password: string;
};

export interface AuthResponseDto<T extends AuthUser> {
  user: UserResponseDto<T>;
  token: string;
}

export const toAuthResponseDto = <T extends AuthUser>(
  user: UserResponseDto<T>,
  token: string,
): AuthResponseDto<T> => ({
  user,
  token,
});
