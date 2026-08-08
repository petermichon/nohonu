function Endpoints({ rows }: { rows: { method: string; path: string; desc: string }[] }) {
  return (
    <table className="w-full text-sm text-left">
      <thead>
        <tr className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
          <th className="font-medium pb-2 pr-4 w-16">Method</th>
          <th className="font-medium pb-2 pr-4">Path</th>
          <th className="font-medium pb-2">Description</th>
        </tr>
      </thead>
      <tbody className="font-mono text-zinc-600 dark:text-zinc-400">
        {rows.map((r) => (
          <tr key={r.method + r.path} className="border-t border-zinc-100 dark:border-zinc-800/50">
            <td className="py-2 pr-4 whitespace-nowrap">
              <span className="text-zinc-950 dark:text-zinc-100 font-semibold">{r.method}</span>
            </td>
            <td className="py-2 pr-4 whitespace-nowrap">{r.path}</td>
            <td className="py-2 whitespace-normal text-zinc-500 dark:text-zinc-400 not-mono">{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DocsApi() {
  return (
    <div>
      <header className="pb-8">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">API</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          REST API for managing sites, versions, domains, and authentication.
        </p>
      </header>

      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
        All API requests require authentication via session cookie or API key. The base URL is the root of your Nohonu
        instance.
      </p>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Authentication</h2>
        <Endpoints
          rows={[
            { method: 'POST', path: '/auth/register', desc: 'Create a new account' },
            { method: 'POST', path: '/auth/login', desc: 'Log in and receive a session' },
            { method: 'POST', path: '/auth/logout', desc: 'End the current session' },
            { method: 'GET', path: '/auth/me', desc: "Get the authenticated user's profile" },
            { method: 'PATCH', path: '/auth/displayname', desc: 'Update display name' },
            { method: 'POST', path: '/auth/profile-picture', desc: 'Upload a profile picture' },
            { method: 'DELETE', path: '/auth/profile-picture/delete', desc: 'Remove profile picture' },
            { method: 'GET', path: '/auth/sessions', desc: 'List active sessions' },
            { method: 'DELETE', path: '/auth/sessions/delete', desc: 'Revoke a session' },
          ]}
        />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Sites</h2>
        <Endpoints
          rows={[
            { method: 'GET', path: '/sites', desc: 'List all sites for the authenticated user' },
            { method: 'GET', path: '/sites/:domain', desc: 'Get site info and status' },
            { method: 'POST', path: '/sites/:domain', desc: 'Create a site from a zip upload' },
            { method: 'POST', path: '/sites/:domain/github', desc: 'Create a site from a GitHub repo' },
            { method: 'DELETE', path: '/sites/:domain', desc: 'Delete a site' },
            { method: 'PATCH', path: '/sites/:domain/toggle', desc: 'Enable or disable a site' },
            { method: 'PATCH', path: '/sites/:domain/star', desc: 'Star or unstar a site' },
            { method: 'PATCH', path: '/sites/:domain/meta', desc: 'Update site metadata' },
            { method: 'GET', path: '/sites/:domain/download', desc: 'Download the active version as zip' },
            { method: 'GET', path: '/sites/:domain/icon', desc: 'Get site icon' },
            { method: 'GET', path: '/sites/:domain/cover', desc: 'Get site cover image' },
            { method: 'POST', path: '/sites/:domain/cover', desc: 'Upload a cover image' },
            { method: 'DELETE', path: '/sites/:domain/cover', desc: 'Remove cover image' },
          ]}
        />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Analytics</h2>
        <Endpoints
          rows={[
            { method: 'GET', path: '/sites/:domain/stats', desc: 'Request counts and bandwidth' },
            { method: 'GET', path: '/sites/:domain/visitors', desc: 'Unique visitor data' },
            { method: 'GET', path: '/sites/:domain/uptime', desc: 'Uptime monitoring data' },
          ]}
        />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Versions</h2>
        <Endpoints
          rows={[
            { method: 'GET', path: '/sites/:domain/versions', desc: 'List all versions' },
            { method: 'POST', path: '/sites/:domain/versions', desc: 'Upload a new version' },
            { method: 'POST', path: '/sites/:domain/versions/:ts/activate', desc: 'Activate a specific version' },
            {
              method: 'POST',
              path: '/sites/:domain/versions/:ts/github',
              desc: 'Fetch from GitHub and create version',
            },
            { method: 'GET', path: '/sites/:domain/versions/download', desc: 'Download a specific version as zip' },
            { method: 'DELETE', path: '/sites/:domain/versions/:ts', desc: 'Delete a version' },
          ]}
        />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Custom Domains</h2>
        <Endpoints
          rows={[
            { method: 'GET', path: '/custom-domains', desc: 'List all custom domains across sites' },
            { method: 'GET', path: '/sites/:domain/custom-domains', desc: 'List domains for a site' },
            { method: 'POST', path: '/sites/:domain/custom-domains', desc: 'Add a custom domain' },
            { method: 'POST', path: '/sites/:domain/custom-domains/:domain/verify', desc: 'Verify DNS ownership' },
            { method: 'DELETE', path: '/sites/:domain/custom-domains/:domain', desc: 'Remove a custom domain' },
            { method: 'GET', path: '/check-domain', desc: 'Check if a subdomain is available' },
            { method: 'GET', path: '/check-custom-domain', desc: 'Check if a custom domain is available' },
          ]}
        />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Users</h2>
        <Endpoints
          rows={[
            { method: 'GET', path: '/users/:username', desc: 'Get public user profile' },
            { method: 'GET', path: '/users/:username/sites', desc: "List a user's public sites" },
            { method: 'GET', path: '/users/:username/profile-picture', desc: 'Get profile picture' },
            { method: 'GET', path: '/users/:username/:domain', desc: 'Get public site info' },
          ]}
        />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Discovery</h2>
        <Endpoints rows={[{ method: 'GET', path: '/explore/sites', desc: 'Browse publicly discoverable sites' }]} />
      </section>

      <section className="py-8 space-y-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Health</h2>
        <Endpoints rows={[{ method: 'GET', path: '/health', desc: 'Server health check (status, uptime, commit)' }]} />
      </section>
    </div>
  );
}
