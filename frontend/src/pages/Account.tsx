import { User, Key } from 'lucide-react';
import { Section } from '../components/Section.tsx';

export default function Account() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6">Account</h1>

      <Section id="profile" icon={User} title="Profile">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Account management is not yet available.
        </p>
      </Section>

      <Section id="security" icon={Key} title="Security">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Security settings are not yet available.
        </p>
      </Section>

      <div className="min-h-[50vh]" />
    </div>
  );
}
