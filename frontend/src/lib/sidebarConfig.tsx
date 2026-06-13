import { type ComponentType } from 'react';
import { Rocket, Globe, Server, ChevronRight, User, Key, FileText, Scale, Shield, Info, Search } from 'lucide-react';
import { SECTIONS, type SectionConfig } from './sectionsConfig.ts';

// Shared numbered-icon factory — replaces 3 local `numIcon` copies + 11 inline closures
function numIcon(n: number): ComponentType<{ className?: string }> {
  return function NumIcon({ className }: { className?: string }) {
    return <span className={`${className} inline-flex items-center justify-center text-[11px] font-medium`}>{n}</span>;
  };
}

export interface NavItemConfig {
  to: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  rightIcon?: ComponentType<{ className?: string }>;
}

export interface SidebarRouteConfig {
  /** Path pattern — exact match or startsWith for dynamic segments */
  path: string;
  /** Whether this is a prefix match (e.g. '/sites/' matches '/sites/foo') */
  matchPrefix?: boolean;
  /** Back button target */
  backTo: string;
  /** Back button label */
  backLabel: string;
  /** Current view label shown in back button */
  currentLabel: string;
  /** Whether to show the back button (default true) */
  showBackButton?: boolean;
  /** Whether back button is disabled (for root/home) */
  disabled?: boolean;
  /** Section nav items for scroll-spy (mutually exclusive with children) */
  sections?: SectionConfig[];
  /** Sub-navigation items (mutually exclusive with sections) */
  children?: NavItemConfig[];
  /** Whether to show breadcrumbs above the sidebar view */
  showBreadcrumbs?: boolean;
  /** Breadcrumb segments — if not provided, derived from path */
  breadcrumbs?: Array<{ label: string; to: string }>;
  /** For 'sites' view: render site list instead of static children */
  renderSiteList?: boolean;
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { to: '/domains', label: 'Domains', icon: Globe },
  { to: '/servers', label: 'Servers', icon: Server },
];

export const MOBILE_NAV_ITEMS: NavItemConfig[] = [
  { to: '/sites', label: 'Sites', icon: Rocket },
  { to: '/domains', label: 'Domains', icon: Globe },
  { to: '/servers', label: 'Servers', icon: Server },
];

export const SIDEBAR_ROUTES: SidebarRouteConfig[] = [
  {
    path: '/legal/privacy-policy',
    backTo: '/legal',
    backLabel: 'Legal',
    currentLabel: 'Privacy Policy',
    sections: [
      { id: 'introduction', label: 'Introduction', icon: numIcon(1) },
      { id: 'information-we-collect', label: 'Info We Collect', icon: numIcon(2) },
      { id: 'how-we-use', label: 'How We Use It', icon: numIcon(3) },
      { id: 'data-sharing', label: 'Data Sharing', icon: numIcon(4) },
      { id: 'data-retention', label: 'Data Retention', icon: numIcon(5) },
      { id: 'cookies', label: 'Cookies & Storage', icon: numIcon(6) },
      { id: 'your-rights', label: 'Your Rights', icon: numIcon(7) },
      { id: 'security', label: 'Security', icon: numIcon(8) },
      { id: 'childrens-privacy', label: "Children's Privacy", icon: numIcon(9) },
      { id: 'changes', label: 'Changes', icon: numIcon(10) },
      { id: 'contact', label: 'Contact Us', icon: numIcon(11) },
    ],
  },
  {
    path: '/legal/terms-of-service',
    backTo: '/legal',
    backLabel: 'Legal',
    currentLabel: 'Terms of Service',
    sections: [
      { id: 'acceptance', label: 'Acceptance', icon: numIcon(1) },
      { id: 'description', label: 'Description', icon: numIcon(2) },
      { id: 'accounts', label: 'User Accounts', icon: numIcon(3) },
      { id: 'acceptable-use', label: 'Acceptable Use', icon: numIcon(4) },
      { id: 'content', label: 'Your Content', icon: numIcon(5) },
      { id: 'payment', label: 'Payment', icon: numIcon(6) },
      { id: 'availability', label: 'Availability', icon: numIcon(7) },
      { id: 'liability', label: 'Liability', icon: numIcon(8) },
      { id: 'indemnification', label: 'Indemnification', icon: numIcon(9) },
      { id: 'termination', label: 'Termination', icon: numIcon(10) },
      { id: 'changes', label: 'Changes', icon: numIcon(11) },
      { id: 'governing-law', label: 'Governing Law', icon: numIcon(12) },
      { id: 'contact', label: 'Contact Us', icon: numIcon(13) },
    ],
  },
  {
    path: '/legal/copyright-policy',
    backTo: '/legal',
    backLabel: 'Legal',
    currentLabel: 'Copyright Policy',
    sections: [
      { id: 'overview', label: 'Overview', icon: numIcon(1) },
      { id: 'reporting', label: 'Reporting', icon: numIcon(2) },
      { id: 'our-response', label: 'Our Response', icon: numIcon(3) },
      { id: 'counter-notice', label: 'Counter-Notice', icon: numIcon(4) },
      { id: 'repeat-infringers', label: 'Repeat Infringers', icon: numIcon(5) },
      { id: 'contact', label: 'Contact', icon: numIcon(6) },
    ],
  },
  {
    path: '/legal/mentions-legales',
    backTo: '/legal',
    backLabel: 'Legal',
    currentLabel: 'Mentions légales',
    sections: [
      { id: 'editeur', label: 'Éditeur', icon: numIcon(1) },
      { id: 'directeur', label: 'Directeur', icon: numIcon(2) },
      { id: 'hebergement', label: 'Hébergement', icon: numIcon(3) },
    ],
  },
  {
    path: '/legal',
    backTo: '/',
    backLabel: 'Home',
    currentLabel: 'Legal',
    children: [
      { to: '/legal/privacy-policy', label: 'Privacy Policy', icon: FileText, rightIcon: ChevronRight },
      { to: '/legal/terms-of-service', label: 'Terms of Service', icon: Scale, rightIcon: ChevronRight },
      { to: '/legal/copyright-policy', label: 'Copyright Policy', icon: Shield, rightIcon: ChevronRight },
      { to: '/legal/mentions-legales', label: 'Mentions légales', icon: Info, rightIcon: ChevronRight },
    ],
  },
  {
    path: '/domains/explore',
    backTo: '/domains',
    backLabel: 'Domains',
    currentLabel: 'Explore',
  },
  {
    path: '/domains',
    backTo: '/',
    backLabel: 'Home',
    currentLabel: 'Domains',
    children: [{ to: '/domains/explore', label: 'Explore', icon: Search, rightIcon: ChevronRight }],
  },
  {
    path: '/servers',
    backTo: '/',
    backLabel: 'Home',
    currentLabel: 'Servers',
  },
  {
    path: '/account',
    backTo: '/',
    backLabel: 'Home',
    currentLabel: 'Account',
    sections: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'security', label: 'Security', icon: Key },
      { id: 'connection', label: 'Connection', icon: Server },
    ],
  },
  {
    path: '/about',
    backTo: '/',
    backLabel: 'Home',
    currentLabel: 'About',
  },
  {
    path: '/sites/',
    matchPrefix: true,
    backTo: '/sites',
    backLabel: 'Sites',
    currentLabel: 'Site',
    sections: SECTIONS,
  },
  {
    path: '/sites',
    backTo: '/',
    backLabel: 'Home',
    currentLabel: 'Sites',
    renderSiteList: true,
  },
];
