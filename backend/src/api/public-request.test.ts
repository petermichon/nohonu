import { describe, it, expect } from 'vitest';
import type { Request } from 'express';
import { isPublicImageRequest, isSubdomainSiteRequest } from './public-request.ts';

function mockReq(method: string, path: string, host = 'nohonu.com'): Request {
  return {
    method,
    baseUrl: '',
    path,
    get: (name: string) => (name.toLowerCase() === 'host' ? host : undefined),
  } as unknown as Request;
}

describe('isPublicImageRequest', () => {
  it('allows GET profile picture requests', () => {
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/profile-picture'))).toBe(true);
  });

  it('allows GET site cover requests', () => {
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/sites/veodee/cover'))).toBe(true);
  });

  it('allows GET site icon requests', () => {
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/sites/veodee/icon'))).toBe(true);
  });

  it('rejects non-image API requests', () => {
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/sites/veodee'))).toBe(false);
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/sites/veodee/stats'))).toBe(false);
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/sites'))).toBe(false);
  });

  it('rejects non-GET requests even on image paths', () => {
    expect(isPublicImageRequest(mockReq('POST', '/users/peter/sites/veodee/cover'))).toBe(false);
  });

  it('ignores query strings', () => {
    expect(isPublicImageRequest(mockReq('GET', '/users/peter/profile-picture?v=1'))).toBe(true);
  });
});

describe('isSubdomainSiteRequest', () => {
  it('allows GET requests on a subdomain of the base', () => {
    expect(isSubdomainSiteRequest(mockReq('GET', '/index.html', 'johndoe-veodee.localhost:8080'))).toBe(true);
  });

  it('rejects requests on the base host itself', () => {
    expect(isSubdomainSiteRequest(mockReq('GET', '/', 'localhost:8080'))).toBe(false);
  });

  it('rejects non-GET requests on a subdomain', () => {
    expect(isSubdomainSiteRequest(mockReq('POST', '/', 'johndoe-veodee.localhost:8080'))).toBe(false);
  });
});
