import { BackButton } from '../components/BackButton.tsx';

export default function TermsOfService() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6 pt-12">
      <div className="mb-5">
        <BackButton to="/legal" label="Legal" />
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Last updated: June 3, 2026</p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section id="acceptance">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Nohonu platform ("Service"), you agree to be bound by these Terms of Service
            ("Terms"). If you do not agree to these Terms, you may not use the Service.
          </p>
        </section>

        <section id="description">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">2. Description of Service</h2>
          <p>
            Nohonu provides a web deployment and hosting platform that allows users to deploy, manage, and monitor
            websites and web applications. We reserve the right to modify, suspend, or discontinue any part of the
            Service at any time.
          </p>
        </section>

        <section id="accounts">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">3. User Accounts</h2>
          <p className="mb-3">
            You must be at least 13 years old to use the Service. By creating an account, you represent that you meet
            this age requirement and agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide accurate and complete information.</li>
            <li>Maintain the security of your account credentials.</li>
            <li>Notify us immediately of any unauthorized access.</li>
            <li>Accept responsibility for all activity under your account.</li>
          </ul>
        </section>

        <section id="acceptable-use">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">4. Acceptable Use</h2>
          <p className="mb-3">You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Violate any applicable laws or regulations.</li>
            <li>Host or distribute malicious software, phishing pages, or spam.</li>
            <li>Infringe on the intellectual property rights of others.</li>
            <li>Distribute illegal, harmful, or objectionable content.</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts.</li>
            <li>Interfere with or disrupt the Service or its infrastructure.</li>
          </ul>
          <p className="mt-3">
            We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
          </p>
        </section>

        <section id="content">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">5. Your Content</h2>
          <p>
            You retain ownership of all content you upload or deploy through the Service. By using the Service, you
            grant us a limited license to host, store, and serve your content as necessary to provide the Service. You
            are solely responsible for ensuring your content complies with applicable laws and does not infringe on
            third-party rights.
          </p>
        </section>

        <section id="payment">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">6. Payment and Billing</h2>
          <p>
            Certain features of the Service may require payment. By selecting a paid plan, you agree to pay all
            applicable fees. Fees are non-refundable unless otherwise stated. We may change pricing with reasonable
            notice. Failure to pay may result in suspension or termination of your account.
          </p>
        </section>

        <section id="availability">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">7. Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may
            perform scheduled or emergency maintenance that temporarily affects availability. We are not liable for any
            downtime or data loss resulting from such maintenance or events beyond our control.
          </p>
        </section>

        <section id="liability">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Nohonu shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, including but not limited to loss of profits, data, or business
            opportunities, arising from your use of the Service. Our total liability shall not exceed the amount you
            paid us in the twelve months preceding the claim.
          </p>
        </section>

        <section id="indemnification">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Nohonu, its officers, employees, and agents from any claims,
            damages, losses, or expenses (including legal fees) arising from your use of the Service, your content, or
            your violation of these Terms.
          </p>
        </section>

        <section id="termination">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">10. Termination</h2>
          <p>
            Either party may terminate this agreement at any time. You may close your account through the account
            settings. We may suspend or terminate your account if you violate these Terms. Upon termination, your right
            to use the Service ceases immediately. We may retain your data for a reasonable period to comply with legal
            obligations.
          </p>
        </section>

        <section id="changes">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">11. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by posting the revised
            Terms on this page and updating the "Last updated" date. Continued use of the Service after changes
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section id="governing-law">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of France. Any disputes arising
            from these Terms shall be subject to the exclusive jurisdiction of the competent courts of France.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a
              href="mailto:nohonu@proton.me"
              className="text-zinc-950 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              nohonu@proton.me
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
