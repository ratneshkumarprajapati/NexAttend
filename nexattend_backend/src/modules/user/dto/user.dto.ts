type UserWithPassword = {
  password: string;
};

export type UserResponseDto<T extends UserWithPassword> = Omit<T, "password">;

export const toUserResponseDto = <T extends UserWithPassword>(
  user: T,
): UserResponseDto<T> => {
  const { password, ...userDto } = user;
  return userDto;
};

export const toUserResponseDtoList = <T extends UserWithPassword>(
  users: T[],
): Array<UserResponseDto<T>> => users.map(toUserResponseDto);
