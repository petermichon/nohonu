import { BackButton } from '../components/BackButton.tsx';
import { useLanguage } from '../lib/LanguageProvider.tsx';

export default function MentionsLegales() {
  const { resolvedLanguage } = useLanguage();

  return (
    <div className="space-y-8">
      <BackButton to="/legal" label="Legal" variant="inline" />

      <div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          {resolvedLanguage === 'fr' ? 'Mentions légales' : 'Legal notice'}
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Conformément aux articles L.111-1 et suivants du Code de la consommation
        </p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section id="editeur">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Éditeur du site</h2>
          <p className="mb-2">
            <strong>Nohonu</strong>
          </p>
          <p className="mb-2">
            <strong>Forme juridique :</strong> [À compléter : SAS, SARL, SASU, etc.]
          </p>
          <p className="mb-2">
            <strong>Capital social :</strong> [À compléter : montant en euros]
          </p>
          <p className="mb-2">
            <strong>SIRET :</strong> [À compléter : numéro SIRET]
          </p>
          <p className="mb-2">
            <strong>SIREN :</strong> [À compléter : numéro SIREN]
          </p>
          <p className="mb-2">
            <strong>Siège social :</strong> [À compléter : adresse complète]
          </p>
          <p className="mb-2">
            <strong>Numéro de TVA intracommunautaire :</strong> [À compléter : FRXXXXXXXXXXX]
          </p>
          <p>
            <strong>Email :</strong> contact@nohonu.com
          </p>
        </section>

        <section id="directeur">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Directeur de la publication</h2>
          <p>
            <strong>Nom :</strong> [À compléter : nom du directeur de la publication]
          </p>
        </section>

        <section id="hebergement">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Hébergement</h2>
          <p className="mb-2">
            <strong>Prestataire :</strong> [À compléter : nom de l'hébergeur, ex: OVH, AWS, Scaleway, etc.]
          </p>
          <p className="mb-2">
            <strong>Adresse :</strong> [À compléter : adresse de l'hébergeur]
          </p>
          <p className="mb-2">
            <strong>Téléphone :</strong> [À compléter : numéro de téléphone de l'hébergeur]
          </p>
          <p>
            <strong>Site web :</strong> [À compléter : URL de l'hébergeur]
          </p>
        </section>
      </div>

      <div className="min-h-[30vh]" />
    </div>
  );
}
