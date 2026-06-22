import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Footer } from '../components/Footer.tsx';

const providers = [
  {
    name: 'Aruba',
    url: 'https://hosting.aruba.it/en/domains/domain-registration/',
    color: '#0089A7',
    hoverColor: '#006E87',
    price: 14.99,
    supportsDomain: false,
  },
  {
    name: 'Combell',
    url: 'https://www.combell.com/en/order-domain-names',
    color: '#0066FF',
    hoverColor: '#0052CC',
    price: 12.09,
    supportsDomain: true,
    domainParam: 'domainname',
  },
  {
    name: 'Domainnameshop',
    url: 'https://new.domene.shop/cart/domains?lang=en',
    color: '#6B4C9A',
    hoverColor: '#5A3D82',
    price: 19.81,
    supportsDomain: true,
    domainParam: 'q',
  },
  {
    name: 'EuroDNS',
    url: 'https://my.eurodns.com/das/search',
    color: '#3EC1E6',
    hoverColor: '#3299B8',
    price: 21.0,
    supportsDomain: true,
    domainParam: 'query',
  },
  {
    name: 'Gandi',
    url: 'https://shop.gandi.net/fr/domain/suggest',
    color: '#0FFE9C',
    hoverColor: '#0DDB7A',
    price: 31.98,
    supportsDomain: true,
    domainParam: 'search',
    textColor: 'text-zinc-900',
  },
  {
    name: 'Hetzner',
    url: 'https://www.hetzner.com/whois/',
    color: '#D50C2D',
    hoverColor: '#B00A25',
    price: 13.5, // 16.20 incl. 20 % VAT
    supportsDomain: false,
  },
  {
    name: 'Hostinger',
    url: 'https://www.hostinger.com/domain-name-results',
    color: '#673DE6',
    hoverColor: '#5532C7',
    price: 19.99,
    supportsDomain: true,
    domainParam: 'domain',
  },
  {
    name: 'INWX',
    url: 'https://www.inwx.de/en/domain/check',
    color: '#1A1A2E',
    hoverColor: '#141424',
    price: 17.37,
    supportsDomain: true,
    domainParam: 'domain',
  },
  {
    name: 'Infomaniak',
    url: 'https://www.infomaniak.com/en/domains',
    color: '#FF3366',
    hoverColor: '#E62E5C',
    price: 16.3,
    supportsDomain: false,
  },
  {
    name: 'Ionos',
    url: 'https://www.ionos.com/domainshop/search',
    color: '#003B73',
    hoverColor: '#002E5C',
    price: 20,
    supportsDomain: false,
  },
  {
    name: 'Joker',
    url: 'https://joker.com/domain/search',
    color: '#FF6B00',
    hoverColor: '#E65A00',
    price: 18.6,
    supportsDomain: true,
    domainParam: null,
    domainInPath: true,
  },
  {
    name: 'Netim',
    url: 'https://www.netim.com/en/domain-name/search',
    color: '#00A3E0',
    hoverColor: '#0085B8',
    price: 16.0,
    supportsDomain: true,
    domainParam: 'domain',
  },
  {
    name: 'NordName',
    url: 'https://app.nordname.eu/en/domains/new',
    color: '#0057B8',
    hoverColor: '#004696',
    price: 17.57,
    supportsDomain: true,
    domainParam: 'domain',
  },
  {
    name: 'OpenProvider',
    url: 'https://cp.openprovider.eu/fast-checkout/',
    color: '#00A651',
    hoverColor: '#008541',
    price: 14.84, // $16.98
    supportsDomain: false,
  },
  {
    name: 'OVHcloud',
    url: 'https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select',
    color: '#000E9C',
    hoverColor: '#000B7A',
    price: 13.49,
    supportsDomain: true,
    domainParam: 'domain',
  },
  {
    name: 'Scaleway',
    url: 'https://console.scaleway.com/search-domain',
    color: '#4F0599',
    hoverColor: '#3D0478',
    price: 12.34,
    supportsDomain: true,
    domainParam: 'domain',
  },
  {
    name: 'United Domains',
    url: 'https://www.uniteddomains.com/searchresult/',
    color: '#E30613',
    hoverColor: '#B8050F',
    price: 24.79, // 29.0 incl. 19 % VAT
    supportsDomain: true,
    domainParam: 'domain',
  },
];

function getProviderUrl(provider: (typeof providers)[0], domain: string): string {
  if (!provider.supportsDomain || !domain) {
    return provider.url;
  }
  if (provider.domainInPath) {
    return `${provider.url}/${domain}`;
  }
  if (provider.domainParam) {
    return `${provider.url}?${provider.domainParam}=${domain}`;
  }
  return provider.url;
}

function DomainExplore() {
  const [domain, setDomain] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === 'price') {
      return a.price - b.price;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="mb-12 max-w-7xl mx-auto px-6 pt-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-zinc-900 dark:text-zinc-50">
          Domain Registrars
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Compare .com domain renewal prices from direct European registrars. Find the best deal for your next domain.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            id="domain-search"
            name="domain-search"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Search for a domain..."
            className="w-full px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{sortedProviders.length} providers</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('price')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                sortBy === 'price'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Sort by Price
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                sortBy === 'name'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Sort by Name
            </button>
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedProviders.map((provider) => (
            <a
              key={provider.name}
              href={getProviderUrl(provider, domain)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg no-underline"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${provider.color}15` }}
                  >
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: provider.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">{provider.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {provider.supportsDomain ? 'Direct search' : 'Visit site'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    €{provider.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">/year</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {provider.supportsDomain && domain ? `Search for "${domain}"` : 'View pricing'}
                </span>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Prices shown are yearly renewal rates excluding VAT where applicable. You will be redirected to the provider's
          site to complete your registration.
        </p>
      </div>
      <Footer />
    </section>
  );
}

export default DomainExplore;
