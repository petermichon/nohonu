export default function DocsCustomDomains() {
  return (
    <div>
      <header className="pb-8">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">Custom Domains</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">Use your own domain with DNS-verified ownership.</p>
      </header>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Adding a Domain</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Add a custom domain in your site's settings, then create a DNS record to verify ownership. Nohonu verifies
          ownership with a <code className="text-sm bg-zinc-100 dark:bg-zinc-900 px-1 rounded">_nohonu.&lt;your-domain&gt;</code>{' '}
          TXT record whose value is the verification token shown in the dashboard.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Verification</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Once your DNS record is added, Nohonu checks it automatically. After verification, your site is served from
          your domain. You can remove or replace domains at any time from the settings page.
        </p>
      </section>
    </div>
  );
}
