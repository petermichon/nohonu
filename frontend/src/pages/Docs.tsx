export default function Docs() {
  return (
    <div>
      <header className="pb-8">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">Getting Started</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          Deploy your first site from a zip archive or GitHub repository.
        </p>
      </header>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Zip Deploy</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Go to the Deploy page, select the zip tab, and choose your file. Nohonu extracts the contents and serves them
          immediately on a <code className="text-sm bg-zinc-100 dark:bg-zinc-900 px-1 rounded">username.nohonu.io</code>{' '}
          subdomain.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">GitHub Deploy</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Connect a GitHub repository and Nohonu pulls the contents directly. No CI setup, no webhooks — just point to a
          repo and it's live. You can re-deploy at any time to sync the latest commit.
        </p>
      </section>
    </div>
  );
}
