export type RouteHandler = (ctx: RouteContext, req: Request) => Promise<Response>;
export type CtxRouteHandler = (req: Request, ctx: RouteContext) => Response | Promise<Response>;

export type RouteContext = {
  domain: string;
  action?: string;
  subAction?: string;
  customDomain?: string;
  timestamp?: number;
  url: URL;
};
