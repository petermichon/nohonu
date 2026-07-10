import { Link } from '@tanstack/react-router';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function OpenCollectiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.54 0 4.894-.79 6.834-2.135l-3.107-3.109a7.715 7.715 0 1 1 0-13.512l3.107-3.109A11.943 11.943 0 0 0 12 0zm9.865 5.166l-3.109 3.107A7.67 7.67 0 0 1 19.715 12a7.682 7.682 0 0 1-.959 3.727l3.109 3.107A11.943 11.943 0 0 0 24 12c0-2.54-.79-4.894-2.135-6.834z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

interface FooterLink {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

export function Footer() {
  const legalLinks: FooterLink[] = [
    { label: 'Privacy', href: '/legal/privacy-policy' },
    { label: 'Terms', href: '/legal/terms-of-service' },
    { label: 'Legal', href: '/legal/legal-notice' },
  ];

  const projectLinks: FooterLink[] = [
    { label: 'Docs', href: '/docs' },
  ];

  const communityLinks: FooterLink[] = [
    { label: 'GitHub', href: 'https://github.com/nohonu', external: true, icon: GitHubIcon },
    {
      label: 'Open Collective',
      href: 'https://opencollective.com/nohonu',
      external: true,
      icon: OpenCollectiveIcon,
    },
    { label: 'Discord', href: 'https://discord.gg/xgSg2mHAdT', external: true, icon: DiscordIcon },
  ];

  return (
    <footer className="py-12">
      <div className="border-t border-zinc-200 dark:border-zinc-900"></div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 pt-12">
          <div className="flex items-center gap-4 justify-self-center md:justify-self-start">
            <Link to="/" className="flex items-center gap-2">
              <span
                className="font-bold text-[18px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 tracking-tight"
                style={{ fontFamily: "'Outfit Variable', sans-serif" }}
              >
                nohonu
              </span>
            </Link>
            <div className="flex gap-3">
              {communityLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400 justify-self-center">
            {[...projectLinks, ...legalLinks].map((link) => (
              <Link key={link.href} to={link.href} className="hover:text-zinc-950 dark:hover:text-zinc-100 whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 justify-self-center md:justify-self-end">© 2026 Nohonu</span>
        </div>
      </div>
    </footer>
  );
}
