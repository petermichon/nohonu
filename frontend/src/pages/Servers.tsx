import { Server } from 'lucide-react';

function Servers() {
  return (
    <section className="mb-12">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">Servers</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Manage server settings and configuration</p>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Server className="w-6 h-6 text-stone-400 dark:text-stone-500" />
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Server configuration coming soon</p>
          <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">Configure your server settings</p>
        </div>
      </div>
    </section>
  );
}

export default Servers;
