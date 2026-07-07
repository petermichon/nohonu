import { BackButton } from '../components/BackButton.tsx';

export default function CopyrightPolicy() {
  return (
    <div className="space-y-8 px-6 pt-12">
      <div className="mb-5">
        <BackButton to="/legal" label="Legal" />
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Copyright Policy</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Last updated: June 3, 2026</p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section id="overview">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">1. Overview</h2>
          <p>
            Nohonu respects the intellectual property rights of others and expects its users to do the same. In
            accordance with the Digital Millennium Copyright Act (DMCA) and other applicable laws, we will respond to
            notices of alleged copyright infringement that comply with the requirements outlined below.
          </p>
        </section>

        <section id="reporting">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">2. Reporting Infringement</h2>
          <p className="mb-3">
            If you believe that content hosted on Nohonu infringes your copyright, please submit a written notice
            containing the following information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>A description of the copyrighted work you claim has been infringed.</li>
            <li>The URL or location of the infringing material on our platform.</li>
            <li>Your name, address, phone number, and email address.</li>
            <li>
              A statement that you have a good faith belief that the use is not authorized by the copyright owner, its
              agent, or the law.
            </li>
            <li>
              A statement, under penalty of perjury, that the information in your notice is accurate and that you are
              the copyright owner or authorized to act on behalf of the owner.
            </li>
            <li>Your physical or electronic signature.</li>
          </ul>
          <p className="mt-3">
            Send your notice to{' '}
            <a
              href="mailto:dmca@nohonu.com"
              className="text-zinc-950 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              dmca@nohonu.com
            </a>
            .
          </p>
        </section>

        <section id="our-response">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">3. Our Response</h2>
          <p className="mb-3">Upon receiving a valid DMCA notice, we may:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Remove or disable access to the allegedly infringing content.</li>
            <li>Notify the user who posted the content that it has been removed.</li>
            <li>Terminate accounts of repeat infringers at our discretion.</li>
          </ul>
        </section>

        <section id="counter-notice">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">4. Counter-Notice</h2>
          <p className="mb-3">
            If you believe your content was removed in error, you may submit a counter-notice containing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Identification of the content that was removed and its location before removal.</li>
            <li>
              A statement under penalty of perjury that you have a good faith belief the content was removed by mistake
              or misidentification.
            </li>
            <li>Your name, address, phone number, and email address.</li>
            <li>
              A statement that you consent to the jurisdiction of the federal court in your district and that you will
              accept service of process from the party who filed the original notice.
            </li>
            <li>Your physical or electronic signature.</li>
          </ul>
          <p className="mt-3">
            Send counter-notices to{' '}
            <a
              href="mailto:dmca@nohonu.com"
              className="text-zinc-950 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              dmca@nohonu.com
            </a>
            . Upon receiving a valid counter-notice, we may restore the removed content within 10–14 business days
            unless the original complainant files a court action.
          </p>
        </section>

        <section id="repeat-infringers">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">5. Repeat Infringers</h2>
          <p>
            Nohonu will, in appropriate circumstances, disable or terminate the accounts of users who are repeat
            copyright infringers.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">6. Contact</h2>
          <p>
            For copyright-related inquiries, contact our designated agent at{' '}
            <a
              href="mailto:dmca@nohonu.com"
              className="text-zinc-950 dark:text-zinc-100 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              dmca@nohonu.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
