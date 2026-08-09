import { BackButton } from '../components/BackButton.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';

export default function MentionsLegales() {
  const { resolvedLanguage } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6 pt-12">
      <div className="mb-5">
        <BackButton to="/legal" label="Legal" />
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">
          {resolvedLanguage === 'fr' ? 'Mentions légales' : 'Legal notice'}
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Conformément aux articles L.111-1 et suivants du Code de la consommation
        </p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section id="editeur">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">Éditeur du site</h2>
          <p className="mb-2">
            <strong>Nohonu</strong> — service d'hébergement de sites web statiques.
          </p>
          <p className="mb-2">
            Le site est édité par un particulier à titre non professionnel (article 6-III de la loi LCEN).
          </p>
          <p className="mb-2">
            Conformément à la loi, l'identité de l'éditeur n'est pas rendue publique et peut être communiquée sur
            demande aux autorités compétentes.
          </p>
          <p>
            <strong>Contact :</strong> nohonu@proton.me
          </p>
        </section>

        <section id="directeur">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">Directeur de la publication</h2>
          <p>
            <strong>Directeur de la publication :</strong> Nohonu (nohonu@proton.me)
          </p>
        </section>

        <section id="hebergement">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">Hébergement</h2>
          <p className="mb-2">
            <strong>Prestataire :</strong> OVH SAS
          </p>
          <p className="mb-2">
            <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France
          </p>
          <p className="mb-2">
            <strong>Téléphone :</strong> +33 9 72 10 10 07
          </p>
          <p>
            <strong>Site web :</strong>{' '}
            <a
              href="https://www.ovh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-950 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              https://www.ovh.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
