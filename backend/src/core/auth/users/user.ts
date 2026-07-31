export interface User {
  passwordHash: string;
  username: string;
  displayName: string;
  createdAt: number;
  profilePicture?: string;
}
