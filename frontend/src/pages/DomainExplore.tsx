import { ExternalLink } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';
import { Modal } from '../lib/Modal.tsx';
import { useState } from 'react';

function DomainExplore() {
  const [domain, setDomain] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'ovh' | 'gandi' | null>(null);

  const redirectToOVH = () => {
    const url = domain
      ? `https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select?domain=${domain}`
      : 'https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select';
    window.open(url, '_blank');
    setShowConfirmModal(false);
    setSelectedProvider(null);
  };

  const redirectToGandi = () => {
    const url = domain
      ? `https://shop.gandi.net/fr/domain/suggest?search=${domain}`
      : 'https://shop.gandi.net/fr/domain/suggest';
    window.open(url, '_blank');
    setShowConfirmModal(false);
    setSelectedProvider(null);
  };

  const handleOVHClick = () => {
    setSelectedProvider('ovh');
    setShowConfirmModal(true);
  };

  const handleGandiClick = () => {
    setSelectedProvider('gandi');
    setShowConfirmModal(true);
  };

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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOVHClick}
              className="flex-1 px-4 py-2 rounded-lg bg-[#000E9C] hover:bg-[#000B7A] text-white font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Search on OVHcloud
            </button>
            <button
              type="button"
              onClick={handleGandiClick}
              className="flex-1 px-4 py-2 rounded-lg bg-[#0FFE9C] hover:bg-[#0DDB7A] text-stone-900 font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Search on Gandi
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-400 dark:text-stone-500">
          You will be redirected to the provider's domain search to check availability and register your domain.
        </p>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedProvider(null);
        }}
        title={`Open ${selectedProvider === 'ovh' ? 'OVHcloud' : 'Gandi'} Domain Search`}
        size="sm"
      >
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          This will open {selectedProvider === 'ovh' ? 'OVHcloud' : 'Gandi'}'s domain search in a new tab. Do you want
          to continue?
        </p>
        <div className="mb-6 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">URL:</p>
          <p className="text-xs text-stone-700 dark:text-stone-300 break-all font-mono">
            {selectedProvider === 'ovh'
              ? domain
                ? `https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select?domain=${domain}`
                : 'https://order.eu.ovhcloud.com/fr/order/webcloud/#/webCloud/domain/select'
              : domain
                ? `https://shop.gandi.net/fr/domain/suggest?search=${domain}`
                : 'https://shop.gandi.net/fr/domain/suggest'}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setShowConfirmModal(false);
              setSelectedProvider(null);
            }}
            className="px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={selectedProvider === 'ovh' ? redirectToOVH : redirectToGandi}
            className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer"
          >
            Open
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default DomainExplore;
