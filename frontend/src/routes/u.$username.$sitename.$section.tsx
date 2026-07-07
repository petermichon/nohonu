import { createFileRoute, notFound, Link, useParams } from '@tanstack/react-router';
import SitePage from '../pages/SitePage';
import { AlertCircle } from 'lucide-react';

const VALID_SECTIONS = ['analytics', 'domains', 'versions', 'settings'];

function SectionNotFound() {
  const { username, sitename } = useParams({ from: '/u/$username/$sitename/$section' });

  return (
    <div className="text-center py-24">
      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
      </div>
      <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Section not found</p>
      <Link
        to="/u/$username/$sitename"
        params={{ username, sitename }}
        className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mt-2 inline-block"
      >
        Back to overview
      </Link>
    </div>
  );
}

export const Route = createFileRoute('/u/$username/$sitename/$section')({
  beforeLoad: ({ params }) => {
    if (!VALID_SECTIONS.includes(params.section)) {
      throw notFound();
    }
  },
  component: SitePage,
  notFoundComponent: SectionNotFound,
});
