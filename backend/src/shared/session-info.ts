export interface SessionInfo {
  id: string;
  username: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: number;
  lastActive: number;
}
