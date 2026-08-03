export interface AuthUser {
  username: string;
  displayName: string;
  profilePicture?: string;
}

export function toAuthUser(user: { username: string; displayName: string; profilePicture: string | null }): AuthUser {
  return {
    username: user.username,
    displayName: user.displayName,
    profilePicture: user.profilePicture ?? undefined,
  };
}
