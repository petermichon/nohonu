import { Server } from 'lucide-react';
import { useConnection } from '../hooks/useConnection.ts';

export default function Account() {
  const { apiBase } = useConnection();

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Account</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">Manage your account settings and preferences.</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Connection
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate" title={apiBase}>
            Backend: {apiBase}
          </p>
        </div>
      </div>
    </section>
  );
}