import { Globe } from 'lucide-react';

function Domains() {
  return (
    <section className="mb-12">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">Domains</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Manage your custom domains</p>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 text-stone-400 dark:text-stone-500" />
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm">No custom domains configured</p>
          <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">Add a custom domain to your sites</p>
        </div>
      </div>
    </section>
  );
}

export default Domains;
