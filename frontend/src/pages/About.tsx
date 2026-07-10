export default function About() {
  return (
    <>
      <section className="mb-12">
        <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">About</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Open-source platform for deploying and discovering static sites.</p>
        </header>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">What Nohonu Is</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Nohonu combines two things: <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">a hosting platform for static sites</strong> and <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">a discovery platform for the web</strong>. Sites live on public user profiles, making it possible to browse what others have built — portfolios, projects, experiments — turning hosting into a community gallery.
            </p>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">How It Works</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
You upload a zip archive or connect a GitHub repository, and it serves the contents on a subdomain.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Why We Built This</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
Most hosting platforms are closed source. Nohonu is open and self-hostable.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Who It's For</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
Developers, designers, hobbyists, students — anyone who wants to put static content on the web without managing servers or configuration.
          </p>
        </section>
      </section>
    </>
  );
}
