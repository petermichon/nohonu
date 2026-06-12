import { ExternalLink } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';
import { useState } from 'react';

function DomainExplore() {
  const [domain, setDomain] = useState('');

  return (
    <section className="mb-12">
      <div className="mb-5">
        <BackButton to="/domains" label="Domains" />
      </div>
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">Explore Domains</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Search and register new domains</p>

        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={
                domain
                  ? `https://console.scaleway.com/search-domain?domain=${domain}`
                  : 'https://console.scaleway.com/search-domain'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#4F0599] hover:bg-[#3D0478] text-white font-medium flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <ExternalLink className="w-4 h-4" />
              Search on Scaleway
            </a>
            <a
              href={
                domain
                  ? `https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select?domain=${domain}`
                  : 'https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#000E9C] hover:bg-[#000B7A] text-white font-medium flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <ExternalLink className="w-4 h-4" />
              Search on OVHcloud
            </a>
            <a
              href="https://www.hetzner.com/whois/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#D50C2D] hover:bg-[#B00A25] text-white font-medium flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <ExternalLink className="w-4 h-4" />
              Search on Hetzner
            </a>
            <a
              href={
                domain
                  ? `https://www.hostinger.com/domain-name-results?domain=${domain}`
                  : 'https://www.hostinger.com/domain-name-results'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#673DE6] hover:bg-[#5532C7] text-white font-medium flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <ExternalLink className="w-4 h-4" />
              Search on Hostinger
            </a>
            <a
              href={
                domain
                  ? `https://shop.gandi.net/fr/domain/suggest?search=${domain}`
                  : 'https://shop.gandi.net/fr/domain/suggest'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#0FFE9C] hover:bg-[#0DDB7A] text-stone-900 font-medium flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <ExternalLink className="w-4 h-4" />
              Search on Gandi
            </a>
          </div>
        </div>

        <p className="text-xs text-stone-400 dark:text-stone-500">
          You will be redirected to the provider's domain search to check availability and register your domain.
        </p>
      </div>
    </section>
  );
}

export default DomainExplore;
