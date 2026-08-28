export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <header className="pt-12 pb-8">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">About</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          Open-source platform for deploying and discovering static sites.
        </p>
      </header>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">What Nohonu Is</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Nohonu combines two things:{' '}
          <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">
            a hosting platform for static sites
          </strong>{' '}
          and{' '}
          <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">a discovery platform for the web</strong>.
          Sites live on public user profiles, making it possible to browse what others have built — portfolios,
          projects, experiments — turning hosting into a community gallery.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">How It Works</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Upload a zip archive or connect a GitHub repository, and Nohonu serves the contents on a subdomain. Every
          deploy creates a new version, so you can roll back to any previous state at any time. You can also bring your
          own custom domain — verify ownership with a DNS record and your site is live.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Features</h2>
        <ul className="text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2 list-disc pl-5">
          <li>Instant deploys from zip archives or GitHub repositories</li>
          <li>Full version history with one-click rollback and download</li>
          <li>Custom domains with DNS-verified ownership</li>
          <li>Built-in analytics — request counts</li>
          <li>User profiles with star/unstar, cover images, and public discovery</li>
          <li>Self-hostable — runs in Docker on a single VPS with a local SQLite database</li>
        </ul>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Why We Built This</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Most hosting platforms are closed source and tie you to a single provider. Nohonu is open source (AGPL-3.0)
          and self-hostable — you own your infrastructure and your data. No vendor lock-in, no database server to
          manage, no opaque pricing. Just static sites, served your way.
        </p>
      </section>

      <section className="py-8">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Who It's For</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Developers, designers, hobbyists, students — anyone who wants to put static content on the web without
          managing servers or configuration. If you can zip a folder or push to GitHub, you can use Nohonu.
        </p>
      </section>
    </div>
  );
}
