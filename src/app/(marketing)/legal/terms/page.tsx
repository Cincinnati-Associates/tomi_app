import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Tomi",
  description: "Tomi Homes, Inc. Terms of Service — the terms governing your access to and use of Tomi's website and services.",
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tomi Homes, Inc.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Effective Date: January 1, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the website located at{" "}
          <a href="https://livetomi.com" className="text-primary underline underline-offset-2 hover:text-primary/80">
            https://livetomi.com
          </a>{" "}
          (the &ldquo;Site&rdquo;) and any products, services, tools, content, or features offered by Tomi Homes, Inc. (&ldquo;Tomi,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
        </p>
        <p>
          By accessing or using the Site or engaging Tomi&apos;s services, you agree to be bound by these Terms. If you do not agree, do not use the Site or services.
        </p>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">About Tomi and Scope of Services</h2>
          <p>
            Tomi provides educational resources, software tools, coordination support, and advisory services related to shared homeownership, real estate planning, and related decision-making.
          </p>
          <p className="mt-3">
            Tomi is not a real estate broker, real estate agent, mortgage lender, loan originator, insurance provider, law firm, accounting firm, or fiduciary. Tomi does not provide legal, tax, lending, insurance, or investment advice.
          </p>
          <p className="mt-3">
            All information and services provided by Tomi are for informational and coordination purposes only.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">No Agency or Fiduciary Relationship</h2>
          <p>
            Your use of the Site or services does not create any agency, fiduciary, partnership, joint venture, or employment relationship between you and Tomi.
          </p>
          <p className="mt-3">
            Tomi does not act on your behalf in transactions and does not make decisions for you. You remain solely responsible for all decisions related to real estate, financing, legal agreements, taxes, insurance, and related matters.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Professional Introductions and Referrals</h2>
          <p>
            As part of its services, Tomi may introduce you to independent third-party professionals, including but not limited to real estate agents, lenders, attorneys, tax and accounting professionals, insurance providers, and other service providers.
          </p>
          <p className="mt-3">
            All such professionals are independent third parties and are not employees, agents, or representatives of Tomi.
          </p>
          <p className="mt-3">You acknowledge and agree that:</p>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>Any engagement with a third-party professional is solely between you and that professional</li>
            <li>Tomi does not supervise, control, or guarantee third-party services or outcomes</li>
            <li>Third-party professionals operate under their own licenses, agreements, and privacy practices</li>
          </ul>
          <p className="mt-3">
            In some cases, Tomi may receive a referral fee, origination fee, or other compensation in connection with introductions to third-party professionals, where permitted by law. Such compensation does not constitute an endorsement or warranty of any third-party services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">User Responsibilities</h2>
          <p className="mb-3">You agree to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Provide accurate and complete information when using the Site or services</li>
            <li>Use the Site and services only for lawful purposes</li>
            <li>Not misuse, interfere with, or disrupt the Site or related systems</li>
            <li>Independently verify information before making financial, legal, or real estate decisions</li>
          </ul>
          <p className="mt-3">You are solely responsible for how you use information provided by Tomi.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">AI-Assisted Tools and Outputs</h2>
          <p>
            Certain Tomi services may use AI-assisted or automated tools to help organize information, generate summaries, model scenarios, or support coordination workflows.
          </p>
          <p className="mt-3">
            AI-generated outputs are informational only, may contain errors or omissions, and should not be relied upon as professional advice. You agree to independently review and validate all outputs before relying on them.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Intellectual Property</h2>
          <p>
            All content on the Site, including text, software, tools, graphics, branding, and documentation, is owned by or licensed to Tomi and is protected by intellectual property laws.
          </p>
          <p className="mt-3">
            You may not copy, modify, distribute, sell, or exploit any Site content without Tomi&apos;s prior written consent, except for personal, non-commercial use.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Disclaimers</h2>
          <p className="uppercase">
            The Site and services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied.
          </p>
          <p className="mt-3 uppercase">
            To the maximum extent permitted by law, Tomi disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p className="mt-3 uppercase">
            Tomi does not guarantee results, outcomes, or suitability of any decision, professional, or transaction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Limitation of Liability</h2>
          <p className="uppercase">
            To the maximum extent permitted by law, Tomi shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profits, data, or opportunity, arising from or related to your use of the Site or services.
          </p>
          <p className="mt-3 uppercase">
            Tomi&apos;s total liability for any claim arising out of or relating to the Site or services shall not exceed the amount paid by you to Tomi, if any, in the twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Indemnification</h2>
          <p className="mb-3">
            You agree to indemnify and hold harmless Tomi, its officers, directors, employees, and affiliates from any claims, damages, losses, or expenses arising from:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Your use of the Site or services</li>
            <li>Your interactions with third-party professionals</li>
            <li>Your violation of these Terms or applicable law</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Termination</h2>
          <p>
            Tomi may suspend or terminate access to the Site or services at any time, with or without notice, if you violate these Terms or misuse the Site.
          </p>
          <p className="mt-3">
            Sections that by their nature should survive termination shall survive.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the State of Minnesota, without regard to conflict of law principles.
          </p>
          <p className="mt-3">
            Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in Minnesota, and you consent to their jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Changes to These Terms</h2>
          <p>
            Tomi may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Contact Information</h2>
          <p>If you have questions about these Terms, contact us at:</p>
          <address className="mt-3 not-italic">
            Tomi Homes, Inc.<br />
            3208 Irving Ave S<br />
            Minneapolis, MN 55408<br />
            <a href="mailto:contact@livetomi.com" className="text-primary underline underline-offset-2 hover:text-primary/80">
              contact@livetomi.com
            </a>
          </address>
        </section>
      </div>
    </div>
  )
}
