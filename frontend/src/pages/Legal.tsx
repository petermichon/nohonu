import { Link } from 'react-router-dom';
import { FileText, Scale, Shield, Info } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';
import { useLanguage } from '../lib/LanguageProvider.tsx';

const getLegalPages = (resolvedLanguage: 'en' | 'fr') => [
  {
    to: '/legal/privacy-policy',
    label: 'Privacy Policy',
    description: 'How we collect, use, and protect your data.',
    Icon: FileText,
  },
  {
    to: '/legal/terms-of-service',
    label: 'Terms of Service',
    description: 'Rules and conditions for using Nohonu.',
    Icon: Scale,
  },
  {
    to: '/legal/copyright-policy',
    label: 'Copyright Policy',
    description: 'How we handle copyright infringement and DMCA requests.',
    Icon: Shield,
  },
  {
    to: '/legal/mentions-legales',
    label: resolvedLanguage === 'fr' ? 'Mentions légales' : 'Legal notice',
    description: 'Legal identification and company information (French LCEN compliance).',
    Icon: Info,
  },
];

export default function Legal() {
  const { resolvedLanguage } = useLanguage();
  const LEGAL_PAGES = getLegalPages(resolvedLanguage);

  return (
    <div className="space-y-8 px-6">
      <BackButton to="/" label="Home" variant="inline" />

      <div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Legal</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Review our policies and terms governing the use of Nohonu.
        </p>
      </div>

      <div className="grid gap-4">
        {LEGAL_PAGES.map(({ to, label, description, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-4 p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-stone-300 dark:hover:border-stone-700"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{label}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8">
        &copy; {new Date().getFullYear()} Nohonu. All rights reserved.
      </div>

      <div className="min-h-[50vh]" />
    </div>
  );
}
