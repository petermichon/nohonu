import { BackButton } from '../components/BackButton.tsx';

export default function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <BackButton to="/legal" label="Legal" variant="inline" />

      <div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Last updated: June 3, 2026</p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section id="introduction">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">1. Introduction</h2>
          <p>
            Nohonu ("we", "our", "us") operates the Nohonu platform. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section id="information-we-collect">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">2. Information We Collect</h2>
          <p className="mb-3">We may collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-zinc-700 dark:text-zinc-300">Account Information</strong> — email address, name,
              and authentication credentials when you create an account.
            </li>
            <li>
              <strong className="text-zinc-700 dark:text-zinc-300">Usage Data</strong> — information about how you
              interact with our platform, including pages visited, features used, and timestamps.
            </li>
            <li>
              <strong className="text-zinc-700 dark:text-zinc-300">Technical Data</strong> — IP address, browser type,
              operating system, and device information collected automatically.
            </li>
            <li>
              <strong className="text-zinc-700 dark:text-zinc-300">Deployed Content</strong> — files and data you
              upload or deploy through our platform.
            </li>
          </ul>
        </section>

        <section id="how-we-use">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To provide, maintain, and improve our services.</li>
            <li>To authenticate your identity and manage your account.</li>
            <li>To monitor usage and detect security threats or abuse.</li>
            <li>To communicate with you about service updates, security alerts, and support.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section id="data-sharing">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with third-party service providers who assist in
            operating our platform (e.g., hosting, analytics), subject to confidentiality agreements. We may also
            disclose information if required by law or to protect our rights.
          </p>
        </section>

        <section id="data-retention">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">5. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide our
            services. You may request deletion of your account and associated data at any time.
          </p>
        </section>

        <section id="cookies">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            6. Cookies &amp; Local Storage
          </h2>
          <p>
            We do not use cookies. We store your preferences (such as theme and connection settings) locally in your
            browser. This data is not sent to our servers and is used solely to improve your experience.
          </p>
        </section>

        <section id="your-rights">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">7. Your Rights</h2>
          <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict processing of your data.</li>
            <li>Request portability of your data.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, please contact us at{' '}
            <a
              href="mailto:privacy@nohonu.com"
              className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              privacy@nohonu.com
            </a>
            .
          </p>
        </section>

        <section id="security">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">8. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your data. However, no method of
            electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section id="childrens-privacy">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">9. Children's Privacy</h2>
          <p>
            Our service is not directed to individuals under the age of 13. We do not knowingly collect personal
            information from children. If we become aware that we have collected data from a child under 13, we will
            take steps to delete that information promptly.
          </p>
        </section>

        <section id="changes">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
            the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:privacy@nohonu.com"
              className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              privacy@nohonu.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="min-h-[30vh]" />
    </div>
  );
}
