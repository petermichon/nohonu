import { assertEquals } from 'jsr:@std/assert@^1.0.0';

// Set SITES_DIR before importing router.ts (which imports paths.ts)
Deno.env.set('SITES_DIR', '/tmp/test_sites');

// Import the function to test
const routerModule = await import('./router.ts');
const routeRequest = routerModule.routeRequest;

Deno.test('routeRequest: routes auth endpoints to auth service', () => {
  assertEquals(routeRequest('/auth'), 'auth');
  assertEquals(routeRequest('/auth/login'), 'auth');
  assertEquals(routeRequest('/auth/register'), 'auth');
  assertEquals(routeRequest('/auth/logout'), 'auth');
  assertEquals(routeRequest('/auth/me'), 'auth');
  assertEquals(routeRequest('/auth/displayname'), 'auth');
});

Deno.test('routeRequest: routes sites endpoints to api service', () => {
  assertEquals(routeRequest('/sites'), 'api');
  assertEquals(routeRequest('/sites/test'), 'api');
  assertEquals(routeRequest('/sites/test/meta'), 'api');
  assertEquals(routeRequest('/sites/test/versions'), 'api');
});

Deno.test('routeRequest: routes users endpoints to api service', () => {
  assertEquals(routeRequest('/users'), 'api');
  assertEquals(routeRequest('/users/test'), 'api');
  assertEquals(routeRequest('/users/test/sites'), 'api');
  assertEquals(routeRequest('/users/test/domain'), 'api');
});

Deno.test('routeRequest: routes other api endpoints to api service', () => {
  assertEquals(routeRequest('/health'), 'api');
  assertEquals(routeRequest('/check-domain'), 'api');
  assertEquals(routeRequest('/check-custom-domain'), 'api');
  assertEquals(routeRequest('/custom-domains'), 'api');
  assertEquals(routeRequest('/explore/sites'), 'api');
});

Deno.test('routeRequest: routes everything else to static service', () => {
  assertEquals(routeRequest('/'), 'static');
  assertEquals(routeRequest('/index.html'), 'static');
  assertEquals(routeRequest('/css/style.css'), 'static');
  assertEquals(routeRequest('/js/app.js'), 'static');
  assertEquals(routeRequest('/favicon.ico'), 'static');
  assertEquals(routeRequest('/some/random/path'), 'static');
});
