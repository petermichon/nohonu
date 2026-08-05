export type UpdateMetaParams = {
  sessionId: string;
  domain: string;
  meta: { subdomain?: string; displayName?: string };
};
