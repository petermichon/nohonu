export type RouteContext = {
  username?: string;
  domain: string;
  action?: string;
  subAction?: string;
  customDomain?: string;
  timestamp?: number;
  url: URL;
};
