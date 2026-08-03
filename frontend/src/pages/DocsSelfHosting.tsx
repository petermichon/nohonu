export default function DocsSelfHosting() {
  return (
    <div>
      <header className="pb-8">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">Self-Hosting</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">Run Nohonu on your own infrastructure with Docker.</p>
      </header>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Requirements</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Nohonu runs on a single VPS with Docker. No database is required — all state is stored on the filesystem. A
          machine with 1 GB of RAM and 10 GB of storage is sufficient for most use cases.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Getting Started</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Clone the repository, configure your environment variables, and run
          <code className="text-sm bg-zinc-100 dark:bg-zinc-900 px-1 rounded"> docker compose up</code>. The setup
          includes the web server, file storage, and all dependencies in a single compose file.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Configuration</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Key environment variables include the listening port, storage path, and the base URL for your instance. Refer
          to the <code className="text-sm bg-zinc-100 dark:bg-zinc-900 px-1 rounded">.env.example</code> file in the
          repository for all available options.
        </p>
      </section>
    </div>
  );
}
