export interface AuthUser {
  username: string;
  displayName: string;
  profilePicture?: string;
}

export interface SessionInfo {
  id: string;
  username: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: number;
  lastActive: number;
}

export interface MeSessionInfo {
  id: string;
  deviceInfo?: string;
  userAgent?: string;
  createdAt: number;
  lastActive: number;
}
