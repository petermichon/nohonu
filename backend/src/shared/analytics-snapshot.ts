export type AnalyticsSnapshot = {
  hits: Record<number, number>;
  visitors: Record<string, { count: number; last: number }>;
  uptime: Record<number, boolean>;
};
